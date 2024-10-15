import { createReadStream } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { join, resolve } from "node:path";

import { watch } from "chokidar";
import mime from "mime";

import Router from "./router.js";
import { exec, kill } from "./runtime.js";
import { transform } from "./runtime/style.js";
import { defaults } from "./utils/common.js";
import { fileExists } from "./utils/fs.js";

import { createLivereload } from "./server/livereload.js";

const routeHandler = async (req, res, { livereload, router }) => {
  const route = router.match(req.url);

  if (!route) return;

  const { doc, styles } = await exec(route.destination, {
    route,
    lang: process.env.LANG,
  });

  const node =
    doc.querySelector("head") ||
    doc.querySelector("body") ||
    doc.querySelector("html") ||
    doc;

  node.insertAdjacentHTML?.(
    "beforeend",
    `<style>${styles.map(s => s.source).join("\n")}</style>`
  );

  livereload.inject(doc);
  res.setHeader("Content-Type", "text/html");
  res.end(doc.toString());

  return true;
};

const assetHandler = async (req, res) => {
  if (![".sass", ".scss", ".css"].some(ext => req.url.endsWith(ext))) {
    return;
  }

  const filePath = join(process.cwd(), req.url);

  try {
    const result = await transform(null, { src: filePath });

    res.writeHead(200, mime.getType(req.url));
    res.end(result.source);
    return true;
  } catch (e) {
    console.error(e);
  }
};

const staticFileHandler = async (req, res, { conf }) => {
  const staticFilePath = join(conf.static, req.url);

  if (!(await fileExists(staticFilePath))) return;

  const stream = createReadStream(staticFilePath);
  res.writeHead(200, mime.getType(staticFilePath));
  stream.pipe(res);

  return true;
};

const notFoundHandler = async (req, res, { livereload }) => {
  const { doc } = await exec(
    resolve(import.meta.dirname, "./server-404.ssg.js")
  );

  livereload.inject(doc);
  res.writeHead(404, { "Content-Type": "text/html" });
  res.end(doc.toString());

  return true;
};

export const createServer = conf => {
  conf = defaults(conf, {
    port: 8080,
    in: resolve(process.cwd(), "pages"),
    static: resolve(process.cwd(), "public"),
  });

  const server = createHttpServer();
  const livereload = createLivereload({ server });
  const router = new Router();
  const context = { conf, livereload, router };

  const requestHandlers = [
    routeHandler,
    assetHandler,
    staticFileHandler,
    notFoundHandler,
  ];

  server.on("request", async (req, res) => {
    for (const onRequest of requestHandlers) {
      try {
        if (await onRequest(req, res, context)) return;
      } catch (e) {
        console.error(e);

        const { doc } = await exec(
          resolve(import.meta.dirname, "./server-500.ssg.js")
        );

        livereload.inject(doc);
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end(doc.toString());
      }
    }
  });

  watch(process.cwd(), {
    persistent: false,
    recursive: true,
    ignoreInitial: true,
    ignored: file => file.includes("node_modules"),
  }).on("all", async () => {
    kill();
    await router.scan(conf.in);
    livereload.send("reload");
  });

  return {
    router,
    livereload,

    async listen() {
      await router.scan(conf.in);
      server.listen(conf.port);
      console.log(`http://localhost:${conf.port}`);
    },
  };
};
