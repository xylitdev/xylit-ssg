import postcss from "postcss";
import { compileAsync, compileStringAsync } from "sass";

import { isSass, Resource } from "./resource.js";

export const createSassTransform = options => async resource => {
  let result;

  const opts = {
    loadPaths: [process.cwd(), "node_modules"],
  };

  if (Array.isArray(options?.loadPaths)) {
    opts.loadPaths.push(...options.loadPaths);
  }

  if (resource.isVirtual) {
    const source = resource.text();
    result = await compileStringAsync(source, opts);
  } else {
    result = await compileAsync(resource.path, opts);
  }

  return new Resource({
    mediaType: "text/css",
    dependencies: result.loadedUrls,
    sourceMap: result.sourceMap,
    contents: result.css,
  });
};

export const createPostcssTransform = plugins => {
  const processor = postcss(plugins);

  return async resource => {
    const css = await resource.text();
    const result = await processor.process(css, {
      from: resource.url,
      to: resource.url,
    });

    return new Resource({
      mediaType: "text/css",
      dependencies: result.loadedUrls,
      sourceMap: result.map,
      contents: result.css,
    });
  };
};

export const createStyleTransform = options => {
  const transformSass = createSassTransform(options?.sass);
  const transformPostcss = createPostcssTransform(options?.postcss);

  return async resource => {
    if (isSass(resource)) {
      resource = await transformSass(resource);
    }

    return transformPostcss(resource);
  };
};
