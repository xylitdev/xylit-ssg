import { resolve } from "node:path";
import { cp } from "node:fs/promises";

import { watch } from "chokidar";

import conf from "./generator/config.js";
import { Bundler, StyleInjector } from "./generator/bundler.js";
import { Engine } from "./generator/engine.js";
import { Pipeline } from "./generator/pipeline.js";
import { LiveServer } from "./server.js";
import { HtmlResponse } from "./server/response.js";

export const serve = async () => {
  const pipeline = new Pipeline();
  const engine = new Engine(conf);
  const server = new LiveServer({
    root: resolve(process.cwd(), "public"),
    port: 8080,
  });

  await engine.scan(resolve(process.cwd(), "pages"));

  server.addRequestHandler(async (req, { rewriter }) => {
    const page = await engine.generate(req.url);

    if (page) {
      rewriter.on("head", new StyleInjector(page.styles));
      return new HtmlResponse(page.doc);
    }
  });

  server.addRequestHandler(async req => {
    const asset = await engine.getAsset(req.url);

    if (asset && !asset.isStatic) {
      return pipeline.process(asset);
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
