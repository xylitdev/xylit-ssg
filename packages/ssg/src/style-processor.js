import { createHash } from "node:crypto";

import postcss from "postcss";
import PostcssModulesPlugin from "postcss-modules";
import { compileAsync, compileStringAsync } from "sass";

import PostcssScopedPlugin from "#postcss-scoped-plugin";
import { createURL } from "#utils/common";

import { isSass, Resource } from "./resource.js";

export const supportedMediaTypes = ["text/x-scss", "text/x-sass", "text/css"];

export class StyleProcessor {
  constructor(config) {
    this.plugins = config?.plugins || [];

    this.sassOptions = {
      loadPaths: [process.cwd(), "node_modules"],
    };

    if (Array.isArray(config?.sass?.loadPaths)) {
      this.sassOptions.loadPaths.push(...config.sass.loadPaths);
    }
  }

  async preprocessSass(resource) {
    let result;

    if (!resource.path) {
      const source = await resource.text();
      result = await compileStringAsync(source, this.sassOptions);
    } else {
      result = await compileAsync(resource.path, this.sassOptions);
    }

    return new Resource({
      ...resource,
      mediaType: "text/css",
      dependencies: result.loadedUrls,
      sourceMap: result.sourceMap,
      contents: result.css,
    });
  }

  async preprocess(resource) {
    if (isSass(resource)) {
      return this.preprocessSass(resource);
    }

    return resource;
  }

  async postprocess(resource, { mode }) {
    const meta = {};
    const plugins = [...this.plugins];

    if (mode?.startsWith?.("module")) {
      plugins.push(
        PostcssModulesPlugin({
          scopeBehaviour: mode.endsWith("global") ? "global" : "local",
          localsConvention: "camelCaseOnly",
          getJSON: (filename, json) => (meta.exports = json),
        })
      );
    } else if (mode === "scoped") {
      const url = createURL(resource.url, { search: "" });
      const scope = createHash("shake256", { outputLength: 5 })
        .update(url.toString())
        .digest("hex");

      plugins.push(PostcssScopedPlugin(`data-${scope}`));
      meta.scope = scope;
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

  async process(resource, options) {
    resource = await this.preprocess(resource);
    resource = await this.postprocess(resource, { ...options });

    return resource;
  }
}
