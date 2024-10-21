import { join, extname, resolve } from "node:path";
import { cp } from "node:fs/promises";

import { exec, kill } from "./runtime.js";
import { watch } from "chokidar";
import mime from "mime";

import conf from "./generator/config.js";
import Router from "./generator/router.js";
import Bundler from "./generator/bundler.js";
import Pipeline, { write } from "./generator/pipeline.js";
// TODO: server shoulnd access runtine sub module
import { transform } from "./runtime/style.js";
import { LiveServer } from "./server.js";

export const serve = async () => {
  const router = new Router();
  const server = new LiveServer({
    root: resolve(process.cwd(), "public"),
    port: 8080,
  });

  await router.scan(resolve(process.cwd(), "pages"));

  server.addRequestHandler(async (req, { rewriter }) => {
    const route = router.match(req.url);

    if (!route) return;

    const { doc, styles } = await exec(route.destination, {
      route,
      lang: process.env.LANG,
    });

    rewriter.on("head", {
      element(element) {
        for (const style of styles) {
          element.append(`<style>${style.source}</style>`, { html: true });
        }
      },
    });

    return new Response(doc, {
      headers: { "Content-Type": "text/html" },
    });
  });

  server.addRequestHandler(async req => {
    if (![".sass", ".scss", ".css"].some(ext => req.url.endsWith(ext))) {
      return;
    }

    const filePath = join(process.cwd(), req.url);
    const result = await transform(null, { src: filePath });

    return new Response(result.source, {
      headers: { "Content-Type": mime.getType("file.css") },
    });
  });

  watch(process.cwd(), {
    persistent: false,
    recursive: true,
    ignoreInitial: true,
    ignored: file => file.includes("node_modules"),
  }).on("all", async () => {
    kill();
    await router.scan(conf.in);
    server.send("reload");
  });

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

    return pipeline.process(src, dest, doc);
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
