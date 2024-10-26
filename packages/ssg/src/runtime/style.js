import { defineGetters } from "#utils/common";
import { lazy } from "#utils/lazy";

import config from "../engine/config.js";
import { Resource } from "../resource.js";
import { StyleProcessor } from "../style-processor.js";

const processor = new StyleProcessor({
  sass: config?.preprocessor?.sass,
});

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

export const createStyleApi = meta => {
  const addGetters = obj =>
    defineGetters(obj, {
      module: conf => addGetters({ ...conf, type: "module" }),
      scoped: conf => addGetters({ ...conf, type: "scoped" }),
      css: conf => createLiteral({ ...conf, meta, lang: "css" }),
      scss: conf => createLiteral({ ...conf, meta, lang: "scss" }),
    });

  return addGetters(bundle => addGetters({ bundle }));
};
