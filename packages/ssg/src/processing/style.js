import postcss from "postcss";
import PostcssModulesPlugin from "postcss-modules";
import { compileAsync, compileStringAsync } from "sass";

import config from "#config";
import PostcssScopedPlugin from "#lib/postcss/scoped-plugin";

import { isSass, Resource } from "../generating/resource.js";

export const supportedMediaTypes = ["text/x-scss", "text/x-sass", "text/css"];

export async function preprocessSass(resource) {
  let result;

  if (!resource.path) {
    const source = await resource.text();
    result = await compileStringAsync(source, config.style.sass);
  } else {
    result = await compileAsync(resource.path, config.style.sass);
  }

  return new Resource({
    ...resource,
    mediaType: "text/css",
    dependencies: result.loadedUrls,
    sourceMap: result.sourceMap,
    contents: result.css,
  });
}

export async function preprocess(resource) {
  if (isSass(resource)) {
    return preprocessSass(resource);
  }

  return resource;
}

export async function postprocess(resource, { mode }) {
  const meta = {};
  const plugins = [...config.style.plugins];

  if (mode?.startsWith?.("module")) {
    plugins.push(
      PostcssModulesPlugin({
        scopeBehaviour: mode.endsWith("global") ? "global" : "local",
        localsConvention: "camelCaseOnly",
        getJSON: (filename, json) => (meta.exports = json),
      })
    );
  } else if (mode?.startsWith?.("scoped")) {
    meta.scope = mode.split("/")[1] ?? "";
    plugins.push(PostcssScopedPlugin(meta.scope));
  }

  const processor = postcss(plugins);
  const css = await resource.text();
  const result = await processor.process(css, {
    from: resource.url.toString(),
    to: resource.url.toString(),
  });

  return new Resource({
    ...resource,
    meta,
    mediaType: "text/css",
    dependencies: result.loadedUrls,
    sourceMap: result.map,
    contents: result.css,
  });
}

export async function processStyle(resource, options) {
  resource = await preprocess(resource);
  resource = await postprocess(resource, { ...options });

  return resource;
}
