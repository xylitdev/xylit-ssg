import { createReadStream } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { load } from "cheerio";
import { watch } from "chokidar";
import mime from "mime";

import { aggregate, debounce } from "#lib/common/function.js";

import config from "#src/config.js";
import { invalidatePath } from "#src/register.js";
import { LiveServer } from "#src/server/live-server.js";
import { Resource } from "#src/ssg/resource.js";
import { ResourceProcessor } from "#src/ssg/resource-processor.js";
import { Router } from "#src/ssg/router.js";

import {
  supportedMediaTypes,
  transformStyle,
} from "#src/transforms/transform-style.js";

import { generateRoute } from "./generate.js";

export async function serve() {
  const router = new Router();
  const server = new LiveServer(config.server);
  const processor = new ResourceProcessor();

  const onAdd = debounce(async () => {
    await router.scan();
    server.send("reload");
    console.info("...files added. reload triggered.");
  }, 20);

  const onChange = aggregate(async args => {
    await invalidatePath(...args.map(([path]) => path));
    server.send("reload");
    console.info("...files modified. reload triggered.");
  }, 20);

  const onUnlink = aggregate(async args => {
    const paths = args.map(([path]) => path);
    await Promise.all([router.unlink(...paths), invalidatePath(...paths)]);

    server.send("reload");
    console.info("...files unlinked. reload triggered.");
  }, 20);

  const requestHandler = async ({ req, sendHtml }) => {
    const route = router.match(req.url);

    if (route) {
      const resource = await generateRoute(route);
      const $ = load(resource.contents);
      const head = $("head");
      head.append(`<script>${server.liveScript}</script>`);

      return sendHtml($.html());
    } else if ([".sass", ".scss", ".css"].some(ext => req.url.endsWith(ext))) {
      const path = join(process.cwd(), req.url);
      const url = pathToFileURL(path);
      const contents = createReadStream(path);

      const resource = await processor.transform(
        new Resource({
          contents,
          path,
          url,
          mediaType: mime.getType(req.url),
        })
      );

      return resource.toResponse();
    }
  };

  await router.scan(config.input);
  server.use(requestHandler);
  processor.addTransform(supportedMediaTypes, transformStyle);

  watch(config.cwd, {
    persistent: true,
    recursive: true,
    ignoreInitial: true,
    ignored: file => file.includes("node_modules"),
  })
    .on("add", onAdd)
    .on("change", onChange)
    .on("unlink", onUnlink);

  await server.listen();
}
