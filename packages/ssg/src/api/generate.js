import { pathToFileURL } from "node:url";

import { load } from "cheerio";

import { findMapLast } from "#lib/common/iterable";
import { isBoolean, isNullish } from "#lib/common/type";
import { memoize } from "#lib/common/function";
import { ScopedDomHandler, AnyChunkParser } from "#lib/htmlparser2";

import { Resource } from "../provision/resource.js";
import { __Context } from "../templating/component.js";
import { less, scss, sass } from "../templating/literals.js";
import { transformStyle } from "../transformation/transform-style.js";

const processStyleIR = memoize(async ir => {
  const resource = await generateStyle(ir);
  const result = await transformStyle(resource, { mode: ir.mode });
  ir.exports = result.exports;

  return result;
});

export async function generateComponent(result) {
  const handler = new ScopedDomHandler();
  const parser = new AnyChunkParser(handler);
  const styles = new Set();

  for await (const { chunk, hierarchy } of result) {
    const styleIRs = hierarchy.at(-1).styles || [];

    for (const style of styleIRs) {
      styles.add(await processStyleIR(style));
    }

    if (isBoolean(chunk) || isNullish(chunk)) continue;

    handler.scope = findMapLast(hierarchy, ({ scope }) => scope);
    parser.write(chunk);
  }

  parser.end();

  return {
    dom: handler.dom,
    styles: await Promise.all([...styles]),
  };
}

export async function generateRoute(route) {
  const path = route.destination;
  const url = pathToFileURL(path);

  const { default: Component } = await import(path);
  const ir = await Component({
    [__Context]: { route, lang: process.env.LANG },
  });

  const { dom, styles } = await generateComponent(ir);

  const head = load(dom)("head");
  styles.forEach(style => {
    head.append(`<style>${style.contents}</style>`);
  });

  return new Resource({ contents: dom, path, url });
}

export async function generateStyle(ir) {
  const resource = new Resource({
    contents: await ir.join(),
    url: ir.url,
    mediaType: "text/css",
  });

  if (ir instanceof less) resource.mediaType = "text/less";
  if (ir instanceof sass) resource.mediaType = "text/x-sass";
  if (ir instanceof scss) resource.mediaType = "text/x-scss";

  return resource;
}
