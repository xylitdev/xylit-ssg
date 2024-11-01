import { createHash } from "node:crypto";

import { createURL, defineGetters } from "#lib/common";
import { lazy } from "#lib/lazy";

import config from "./config.js";
import { Resource } from "./processing/resource.js";
import { StyleProcessor } from "./processing/style-processor.js";
import { html } from "./templating/literals.js";
import { createComponent } from "./templating/component.js";

const processor = new StyleProcessor(config.style);

const transform = async (contents, { meta, lang, type }) => {
  const resource = new Resource({
    contents,
    url: meta.url,
    mediaType:
      {
        less: "text/less",
        sass: "text/x-sass",
        scss: "text/x-scss",
      }[lang] ?? "text/css",
  });

  return processor.process(resource, { mode: type });
};

const createLiteral =
  ({ meta, lang, type }) =>
  (strings, ...values) => {
    // potential fix for: https://github.com/lit/lit-element/issues/637?
    const source = String.raw({ raw: strings.raw }, ...values);
    const result = transform(source, { meta, lang, type });

    meta.styleDefinitions.push(result);

    return lazy(result.then(r => r.exports));
  };

const createStyleApi = meta => {
  const addGetters = obj =>
    defineGetters(obj, {
      module: conf => addGetters({ ...conf, type: "module" }),
      scoped: conf => addGetters({ ...conf, type: "scoped" }),
      css: conf => createLiteral({ ...conf, meta, lang: "css" }),
      scss: conf => createLiteral({ ...conf, meta, lang: "scss" }),
    });

  return addGetters(bundle => addGetters({ bundle }));
};

export function initialize(meta) {
  let ctx;
  meta.styleDefinitions = [];
  meta.urlHash = createHash("shake256", { outputLength: 5 })
    .update(createURL(meta.url, { search: "" }).toString())
    .digest("hex");

  return {
    html,
    style: createStyleApi(meta),

    createComponent(template) {
      return createComponent({
        id: meta.urlHash,
        styles: meta.styleDefinitions,
        template,
        context: () => ctx,
      });
    },

    setContext(context) {
      ctx = context;
    },
  };
}
