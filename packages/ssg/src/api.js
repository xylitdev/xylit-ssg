import { resolve } from "node:path";
import { cp } from "node:fs/promises";

import { load } from "cheerio";
import { watch } from "chokidar";

import { LiveServer } from "#lib/live-server";

import conf from "./generator/config.js";
import { Bundler } from "./generator/bundler.js";
import { Engine } from "./generator/engine.js";
import { Pipeline } from "./generator/pipeline.js";

export const serve = async () => {
  const pipeline = new Pipeline();
  const engine = new Engine(conf);
  const server = new LiveServer({
    root: resolve(process.cwd(), "public"),
    port: 8080,
  });

  await engine.scan(resolve(process.cwd(), "pages"));

  server.use(async ({ req, sendHtml, sendStream }, next) => {
    const page = await engine.generate(req.url);

    if (page) {
      const $ = load(page.doc);
      const head = $("head");

      page.styles.forEach(style => {
        head.append(`<style>${style.source}</style>`);
      });

      head.append(`<script>${server.liveScript}</script>`);

      return sendHtml($.html());
    }

    let resource = await engine.getAsset(req.url);

    if (resource && !resource.isStatic) {
      resource = await pipeline.process(resource);

      return sendStream(resource.contents, {
        headers: { "Content-Type": resource.mediaType },
      });
    }
  });

  watch(process.cwd(), {
    persistent: false,
    recursive: true,
    ignoreInitial: true,
    ignored: file => file.includes("node_modules"),
  }).on("all", async () => {
    await engine.scan();
    server.send("reload");
  });

  await server.listen();
};

export const build = async () => {
  const bundler = new Bundler();
  const pipeline = new AssetPipeline();
  const engine = new TemplateEngine();

  await engine.scan();

  for (const url of engine.sitemap()) {
    const page = await engine.generate(url);
    bundler.add(page);
  }

  await bundler.flush(asset => pipeline.process(asset));

  await cp(conf?.static ?? "public", conf?.out ?? "dist", {
    recursive: true,
  }).catch(() => {
    console.warn("static folder doesnt exist");
  });
};
