import { resolve } from "node:path";
import config from "xylit:config";

import postcss from "postcss";
import PostcssModulesPlugin from "postcss-modules";
import PostcssScopedPlugin from "../postcss/scoped-plugin.js";
import { compileAsync, compileStringAsync } from "sass";

import { isArray, defineGetters } from "../utils/common.js";

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

    const exports = {};
    const result = transform(source, { lang, type, hash: meta.urlHash });

    meta.styleDefinitions.push(result);
    result.then(result => Object.assign(exports, result.exports));

    return exports;
  };

export const createStyleApi = meta => {
  const getters = {
    module: conf => defineGetters({ ...conf, type: "module" }, getters),
    scoped: conf => defineGetters({ ...conf, type: "scoped" }, getters),
    css: conf => createLiteral({ ...conf, meta, lang: "css" }),
    scss: conf => createLiteral({ ...conf, meta, lang: "scss" }),
  };

  return defineGetters(bundle => defineGetters({ bundle }, getters), getters);
};
