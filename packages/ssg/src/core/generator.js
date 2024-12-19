import { load } from "cheerio/slim";

import { memoize } from "#lib/common/function.js";
import { findMapLast } from "#lib/common/iterable.js";
import { isBoolean, isNullish } from "#lib/common/type.js";
import { ScopedDomHandler, AnyChunkParser } from "#lib/htmlparser2.js";

import { __Context } from "./component.js";
import { less, scss, sass } from "./literals.js";
import { Resource } from "./resource.js";

export function createGenerator(transform) {
  const generateStyle = memoize(async ir => {
    let mediaType = "text/css";

    if (ir instanceof less) mediaType = "text/less";
    if (ir instanceof sass) mediaType = "text/x-sass";
    if (ir instanceof scss) mediaType = "text/x-scss";

    const resource = new Resource({
      contents: [await ir.join()],
      meta: ir.meta,
      mediaType,
    });

    return resource;
  });

  const generateDocument = memoize(async ir => {
    const handler = new ScopedDomHandler();
    const parser = new AnyChunkParser(handler);
    const assets = new Set();

    for await (const { chunk, hierarchy } of ir) {
      const styleIRs = hierarchy.at(-1).styles || [];

      for (const styleIR of styleIRs) {
        const resource = await generateStyle(styleIR).then(transform);

        assets.add(resource);
      }

      if (isBoolean(chunk) || isNullish(chunk)) continue;

      handler.scope = findMapLast(hierarchy, ({ scope }) => scope);
      parser.write(chunk);
    }

    parser.end();

    return { dom: handler.dom, assets: [...assets] };
  });

  return {
    isTemplate(path) {
      return path.endsWith(".ssg.js");
    },

    async generate(path, context) {
      const { default: Component } = await import(path);
      const ir = await Component({ [__Context]: context });

      const { dom, assets } = await generateDocument(ir);
      const $ = load(dom);

      const head = $("head");
      for (const asset of assets) {
        if (asset instanceof Resource) {
          $("head").append(`<style>${asset.contents}</style>`);
        } else {
          head.append(asset);
        }
      }

      return $;
    },
  };
}
