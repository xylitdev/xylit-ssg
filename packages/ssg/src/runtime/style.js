import postcss from "postcss";
import PostcssModulesPlugin from "postcss-modules";
import { compileAsync, compileStringAsync } from "sass";

import { defineGetters, isArray } from "#lib/utils/common";
import { lazy } from "#lib/utils/lazy";
import PostcssScopedPlugin from "#lib/postcss-scoped-plugin";

// TODO: runtime shouldn't have generator dependencies
import config from "../generator/config.js";

const transformSass = async input => {
  const langReg = /(sass|scss)$/;

  if (!langReg.test(input.src) && !langReg.test(input.lang)) {
    return input;
  }

  const options = {
    loadPaths: [process.cwd(), "node_modules"],
  };

  if (isArray(config?.preprocessor?.sass?.loadPaths)) {
    options.loadPaths.push(...config.preprocessor.sass.loadPaths);
  }

  let sassResult;

  if (input.source) {
    sassResult = await compileStringAsync(input.source, options);
  } else {
    sassResult = await compileAsync(input.src, options);
  }

  return {
    ...input,
    lang: "css",
    source: sassResult.css,
    sourceMap: sassResult.sourceMap,
    dependencies: sassResult.loadedUrls,
  };
};

const transformScoped = async input => {
  if (input.type !== "scoped") return input;

  const processor = postcss([PostcssScopedPlugin(`data-${input.hash}`)]);

  const postCssResult = await processor.process(input.source, {
    from: input.src,
  });

  return { ...input, source: postCssResult.css };
};

const transformModule = async input => {
  if (input.type !== "module") return input;

  let exports;

  const processor = postcss([
    PostcssModulesPlugin({
      scopeBehaviour: input.type.endsWith("global") ? "global" : "local",
      localsConvention: "camelCaseOnly",
      getJSON: (filename, json) => (exports = json),
    }),
  ]);

  const postCssResult = await processor.process(input.source, {
    from: input.src,
  });

  return { ...input, exports, source: postCssResult.css };
};

export const transform = async (source, options) =>
  [transformSass, transformScoped, transformModule].reduce(
    (prev, step) => prev.then(step),
    Promise.resolve({
      type: "",
      lang: "css",
      sourceMap: undefined,
      dependencies: [],
      source,
      ...options,
    })
  );

const createLiteral =
  ({ meta, lang, type }) =>
  (strings, ...values) => {
    // potential fix for: https://github.com/lit/lit-element/issues/637?
    const source = String.raw({ raw: strings.raw }, ...values);
    const result = transform(source, { lang, type, hash: meta.urlHash });

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
