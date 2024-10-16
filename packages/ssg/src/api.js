#!/usr/bin/env node

import { join, extname } from "node:path";
import { cp } from "node:fs/promises";

import conf from "./generator/config.js";
import Router from "./generator/router.js";
import Bundler from "./generator/bundler.js";
import Pipeline, { write } from "./generator/pipeline.js";
import { exec } from "./runtime.js";
import { transform } from "./runtime/style.js";
import { createServer } from "./server/server.js";

export const serve = async () => {
  const server = createServer();
  await server.listen();
};

export const build = async () => {
  const router = new Router({ root: conf.in });
  const bundler = new Bundler();
  const pipeline = new Pipeline();

  await router.scan();

  const deferred = [];
  const processed = [];

  const generate = async ({ doc, styles, route }) => {
    bundler.injectStyle(doc, ...styles);

    const src = route.destination;
    const dest = join(
      process.cwd(),
      conf?.out ?? "dist",
      route.path,
      "index.html"
    );

    const links = doc.querySelectorAll("link[rel=stylesheet][href]");
    processed.push(
      ...links.map(async node => {
        const src = node.getAttribute("href");
        const ext = extname(src);
        const newSrc = `${src.slice(0, src.length - ext.length)}.css`;
        node.setAttribute("href", newSrc);

        const result = await transform(null, { src });
        const dest = join("dist", newSrc);

        await write(dest, result.source);
      })
    );

    return pipeline.process(src, dest, doc.toString());
  };

  processed.push(
    cp(conf?.static ?? "public", conf?.out ?? "dist", {
      recursive: true,
    }).catch(() => {
      console.warn("static folder doesnt exist");
    })
  );

  for (const [pattern, entry] of router.entries()) {
    const route = { ...entry, path: pattern };
    const page = await exec(entry.destination, {
      route,
      lang: process.env.LANG,
    });

    if (page.styles.some(s => s.bundle?.startsWith?.("/"))) {
      deferred.push(page);
    } else {
      processed.push(generate(page));
    }
  }

  for (const page of deferred) {
    processed.push(generate(page));
  }

  await Promise.all(processed);
};
