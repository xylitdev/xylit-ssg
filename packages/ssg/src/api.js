import { cp } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { load } from "cheerio";
import { watch } from "chokidar";

import { debounce } from "#lib/common";

import { LiveServer } from "./server/server.js";

import conf from "./engine/config.js";
import { Bundler } from "./engine/bundler.js";
import { Engine } from "./engine/engine.js";
import { invalidate } from "./runtime/runtime.js";

export const serve = async () => {
  const engine = new Engine(conf);
  const server = new LiveServer({
    root: resolve(process.cwd(), "public"),
    port: 8080,
  });

  await engine.scan(resolve(process.cwd(), "pages"));

  server.use(async ({ req, sendHtml, sendStream }) => {
    let resource = await engine.generate(req.url);

    if (resource) {
      const $ = load(resource.contents);
      const head = $("head");
      head.append(`<script>${server.liveScript}</script>`);

      return sendHtml($.html());
    }

    resource = await engine.getAsset(req.url);

    if (resource && !resource.isStatic) {
      resource = await engine.transform(resource);

      return resource.toResponse();
    }
  });

  watch(process.cwd(), {
    persistent: true,
    recursive: true,
    ignoreInitial: true,
    ignored: file => file.includes("node_modules"),
  }).on(
    "all",
    debounce(
      async args => {
        const urls = args.map(([_, path]) => pathToFileURL(path).toString());

        await invalidate(...urls);
        await engine.scan();
        server.send("reload");
        console.info("...reload triggered");
      },
      20,
      { aggregate: true }
    )
  );

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
