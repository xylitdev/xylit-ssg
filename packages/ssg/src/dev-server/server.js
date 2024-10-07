import { createReadStream } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { join, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { watch } from "chokidar";
import { parse } from "node-html-parser";
import mime from "mime";

import { addDependency, dependantsOf } from "../dependencies.js";
import Router from "../router.js";
import { render } from "../render-process.js";
import { transform } from "../literals/style.js";
import { defaults } from "../utils/common.js";
import { fileExists } from "../utils/fs.js";

import { createLivereload } from "./livereload.js";
import Server404 from "./server-404.xylit";
import Server500 from "./server-500.xylit";

export const createServer = conf => {
  conf = defaults(conf, {
    port: 8080,
    pages: process.cwd(),
    static: process.cwd(),
  });

  const server = createHttpServer();
  const livereload = createLivereload({ server });
  const router = new Router();

  server.on("request", async (req, res) => {
    const componentPath = router.match(req.url);

    if (componentPath) {
      let doc;
      const componentDir = dirname(componentPath);

      try {
        const { content, styles } = await render({
          componentPath,
          context: {
            url: { pathname: req.url },
          },
        });

        doc = parse(content);

        const node =
          doc.querySelector("head") ||
          doc.querySelector("body") ||
          doc.querySelector("html") ||
          doc;

        node.insertAdjacentHTML?.(
          "beforeend",
          `<script>
            window.addEventListener('xylit:livereload', ({ detail: { type, payload }}) => {
              switch (type) {
                case 'change':
                  payload?.forEach(dependency => {
                    const sheet = document.querySelector(\`[data-dependency="\${dependency}"\`)
                   
                    if(!sheet) return;

                    const newSheet = sheet.cloneNode();
                    const removeOldSheet = e => { sheet.remove(); }

                    newSheet.addEventListener('load', removeOldSheet);
                    newSheet.addEventListener('error', removeOldSheet);
                    newSheet.setAttribute('href', sheet.getAttribute('href'))
                    sheet.insertAdjacentElement("afterend", newSheet);
                  });
              }
            });
          </script>`
        );

        node.insertAdjacentHTML?.(
          "beforeend",
          `<style>${styles.map(s => s.source).join("\n")}</style>`
        );

        doc.querySelectorAll("link[rel=stylesheet]")?.forEach?.(node => {
          const href = node.getAttribute("href");
          const filePath = resolve(componentDir, href);

          node.setAttribute(
            "data-dependency",
            pathToFileURL(filePath).toString()
          );
        });

        res.setHeader("Content-Type", "text/html");
      } catch (e) {
        console.error(e);
        doc = await Server500().then(parse);
        res.writeHead(500, { "Content-Type": "text/html" });
      }

      livereload.inject(doc);
      return res.end(doc.toString());
    }

    if ([".sass", ".scss", ".css"].some(ext => req.url.endsWith(ext))) {
      const filePath = join(process.cwd(), req.url);

      try {
        const result = await transform(null, { src: filePath });

        addDependency(
          pathToFileURL(filePath).toString(),
          ...result.dependencies.map(url => url.toString())
        );

        res.writeHead(200, mime.getType(req.url));
        res.end(result.source);
      } catch (e) {
        console.error(e);
        const doc = await Server404().then(parse);
        livereload.inject(doc);

        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(doc.toString());
      }

      return;
    }

    const staticFilePath = join(conf.static, req.url);

    if (await fileExists(staticFilePath)) {
      const stream = createReadStream(staticFilePath);

      res.writeHead(200, mime.getType(staticFilePath));
      stream.pipe(res);

      return;
    }

    const doc = await Server404().then(parse);
    livereload.inject(doc);

    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(doc.toString());
  });

  watch(process.cwd(), {
    persistent: false,
    recursive: true,
    ignoreInitial: true,
    ignored: file => file.includes("node_modules"),
  }).on("all", async (event, file) => {
    await router.scan(conf.pages);

    const fileUrl = pathToFileURL(file).toString();

    if (fileUrl.endsWith(".scss")) {
      // first test of css hot reloading (for now only scss files)
      const dependants = dependantsOf(fileUrl);

      livereload.send("change", [fileUrl, ...dependants]);
    } else {
      livereload.send("reload");
    }
  });

  return {
    router,
    livereload,

    async listen() {
      await router.scan(conf.pages);
      server.listen(conf.port);
      console.log(`http://localhost:${conf.port}`);
    },
  };
};
