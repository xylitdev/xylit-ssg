import { resolve } from "node:path";

import postcss from "postcss";
import PostcssModulesPlugin from "postcss-modules";
import PostcssScopedPlugin from "../postcss/scoped-plugin.js";
import { compileAsync, compileStringAsync } from "sass";

import { isArray, raw } from "../utils/common.js";

export const styles = new Map();

const transformSass = async input => {
  const langReg = /(sass|scss)$/;
  const options = { loadPaths: ["node_modules", "../../node_modules"] };

  if (!langReg.test(input.src) && !langReg.test(input.lang)) {
    return input;
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

export const createStyleLiteral = meta => {
  const callTransform = (source, options) => {
    const exports = {};

    const result = transform(source, {
      hash: meta.urlHash,
      ...options,
      src: options.src && resolve(meta.dirname, options.src),
    });

    meta.styleDefinitions.push(source, result);
    result.then(result => Object.assign(exports, result.exports));

    return exports;
  };

  const callLiteral = (strings, values, options) =>
    callTransform(raw(strings, ...values), { type: "scoped", ...options });

  return (arg0, ...rest) => {
    return isArray(arg0)
      ? callLiteral(arg0, rest)
      : arg0?.src
      ? callTransform(null, arg0)
      : (strings, ...values) => callLiteral(strings, values, arg0);
  };
};
