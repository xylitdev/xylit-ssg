import { watch } from "chokidar";

import { aggregate, debounce } from "#lib/common/function.js";

import config from "#src/config.js";
import { invalidatePath } from "#src/register.js";
import { LiveServer } from "#src/server/live-server.js";
import { Generator } from "#src/core/generator.js";
import { createPipeline } from "#src/core/pipeline.js";
import { Resource } from "#src/core/resource.js";
import { createRouter } from "#src/core/router.js";
import { createCssProcessor } from "#src/processors/css-processor.js";
import { createSassProcessor } from "#src/processors/sass-processor.js";
import { __Context } from "#src/template/component.js";

export async function serve() {
  const { transform } = createPipeline(
    createSassProcessor(config.style.sass),
    createCssProcessor()
  );

  const generator = new Generator(transform);
  const server = new LiveServer(config.server);
  const router = createRouter({
    input: config.input,
    base: server.base,
    lang: process.env.LANG,
  });

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

    if (path.endsWith(".ssg.js")) {
      const { default: Component } = await import(path);
      const ir = await Component({ [__Context]: { url, lang } });
      const { document, assets } = await generator.generateDocument(ir);
      document.mount(...assets, `<script>${server.liveScript}</script>`);

      return document.toResponse();
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
