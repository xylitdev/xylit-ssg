import { cp } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { load } from "cheerio";
import { watch } from "chokidar";

import { debounce } from "#lib/common";

import config from "./config.js";
import { LiveServer } from "./serving/server.js";
import { Ssg, invalidate } from "./ssg.js";

export const serve = async () => {
  const ssg = new Ssg();
  const server = new LiveServer(config.server);

  await ssg.scan(config.input);

  server.use(async ({ req, sendHtml }) => {
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

  watch(config.cwd, {
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
  await cp(config.input, config.output, { recursive: true }).catch(() => {
    console.warn("static folder doesnt exist");
  });
};
