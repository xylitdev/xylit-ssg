import { cp } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { load } from "cheerio";
import { watch } from "chokidar";

import { debounce } from "#lib/common";

import conf from "./config.js";
import { LiveServer } from "./serving/server.js";
import { Ssg, invalidate } from "./ssg.js";

export const serve = async () => {
  const ssg = new Ssg(conf);
  const server = new LiveServer({
    root: resolve(process.cwd(), "public"),
    port: 8080,
  });

  await ssg.scan(resolve(process.cwd(), "pages"));

  server.use(async ({ req, sendHtml, sendStream }) => {
    let resource = await ssg.generate(req.url);

    if (resource) {
      const $ = load(resource.contents);
      const head = $("head");
      head.append(`<script>${server.liveScript}</script>`);

      return sendHtml($.html());
    }

    resource = await ssg.getAsset(req.url);

    if (resource && !resource.isStatic) {
      resource = await ssg.transform(resource);

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
        await ssg.scan();
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
  await cp(conf?.static ?? "public", conf?.out ?? "dist", {
    recursive: true,
  }).catch(() => {
    console.warn("static folder doesnt exist");
  });
};
