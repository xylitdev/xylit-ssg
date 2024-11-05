import { createReadStream } from "node:fs";
import { pathToFileURL } from "node:url";

import mime from "mime";

import { Resource } from "./resource.js";

export class ResourceProcessor {
  transforms = [];

  addTransform(condition, transform) {
    const entry = [condition, transform];

    if (typeof condition === "string") {
      entry[0] = ({ mediaType }) => mediaType;
    } else if (Array.isArray(condition)) {
      entry[0] = ({ mediaType }) => condition.includes(mediaType);
    }

    this.transforms.unshift(entry);
  }

  async transform(resource, options) {
    for (const [condition, transform] of this.transforms) {
      if (!condition(resource)) continue;

      return transform(resource, options);
    }

    return resource;
  }

  async transformSrc(path, options) {
    const resource = new Resource({
      path,
      url: pathToFileURL(path),
      contents: createReadStream(path),
      mediaType: mime.getType(path),
    });

    return this.transform(resource, options);
  }
}
