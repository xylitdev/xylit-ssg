import { rm } from "node:fs/promises";
import { join, relative } from "node:path";

import { concurrent } from "#lib/common/async.js";
import { partition } from "#lib/common/async-iterable.js";
import { write } from "#lib/fs.js";

import config from "#src/config.js";
import { Resource } from "#src/core/resource.js";

import { setup } from "./setup.js";

export async function build() {
  const { input, output } = config;
  const { isTemplate, generate, router, transform } = await setup(config);

  const [templates, resources] = await partition(router, entry =>
    isTemplate(entry.path)
  );

  await rm(output, { recursive: true, force: true });

  const resourceMap = {};
  await concurrent(resources, async ({ path }) => {
    const resource = Resource.fromFile(path);
    const transformed = await transform(resource);

    const srcUrl = router.pathToUrl(resource.path);
    const destUrl = router.pathToUrl(transformed.path);
    const dest = join(output, destUrl.pathname);

    await write(dest, transformed.contents);
    resourceMap[srcUrl.pathname] = destUrl.pathname;
  });

  await concurrent(templates, async ({ path, url, lang }) => {
    const dest = join(output, url.pathname, "index.html");
    const $ = await generate(path, { url, lang });

    $("link[href]").each((i, el) => {
      const href = new URL(el.attribs.href, url).pathname;

      if (resourceMap[href]) {
        el.attribs.href = resourceMap[href];
      }
    });

    await write(dest, [$.html()]);
  });

  console.log("build complete!");
}
