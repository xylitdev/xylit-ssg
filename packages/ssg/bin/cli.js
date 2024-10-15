#!/usr/bin/env node

import { join, extname } from "node:path";
import { cp } from "node:fs/promises";

import { program } from "commander";

import conf from "../src/config.js";
import Router from "../src/router.js";
import Bundler from "../src/bundler.js";
import Pipeline, { write } from "../src/pipeline.js";
import { transform } from "../src/literals/style.js";
import { createServer } from "../src/dev-server/server.js";

program
  .name("ssg")
  .description("CLI to generate static websites with xylit-ssg")
  .version("0.0.1");

program
  .command("dev")
  .alias("")
  .option("-p, --port <number>", "port number", 8080)
  .action(async ({ port }) => {
    const server = createServer();
    await server.listen();
  });

program
  .command("build")
  .argument("[input]")
  .action(async () => {
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

    for (const [pattern] of router.entries()) {
      const pages = await router.resolve(pattern);

      for (const page of pages) {
        if (page.styles.some(s => s.bundle?.startsWith?.("/"))) {
          deferred.push(page);
        } else {
          processed.push(generate(page));
        }
      }
    }

    for (const page of deferred) {
      processed.push(generate(page));
    }

    await Promise.all(processed);
    process.exit();
  });

program.parse();
