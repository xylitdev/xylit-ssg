import { watch } from "chokidar";

import { aggregate, debounce } from "#lib/common/function.js";

import config from "#src/config.js";
import { Resource } from "#src/core/resource.js";
import { invalidatePath } from "#src/register.js";
import { LiveServer } from "#src/server/live-server.js";

import { setup } from "./setup.js";

export async function serve() {
  const { isTemplate, generate, router, transform } = await setup(config);
  const server = new LiveServer(config.server);

  const onAdd = debounce(async () => {
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
    await invalidatePath(...paths);
    server.send("reload");
    console.info("...files unlinked. reload triggered.");
  }, 20);

  server.use(async ({ req }) => {
    const entry = await router.match(req.url);

    if (!entry) return;

    const { path, url, lang } = entry;

    if (isTemplate(path)) {
      const $ = await generate(path, { url, lang });
      $("head").append(`<script>${server.liveScript}</script>`);

      return new Response($.html(), {
        headers: { "Content-Type": "text/html" },
      });
    } else {
      const resource = Resource.fromFile(path);
      const transformed = await transform(resource);

      return transformed.toResponse();
    }
  });

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
