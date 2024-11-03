import { text } from "node:stream/consumers";

export class Resource {
  constructor(options) {
    Object.assign(this, options);
  }

  get isCss() {
    return this.mediaType === "text/css";
  }

  get isLess() {
    return this.mediaType === "text/less";
  }

  get isSass() {
    return ["text/x-scss", "text/x-sass"].includes(this.mediaType);
  }

  async text() {
    return text(this.contents);
  }

  toResponse() {
    return new Response(this.contents, {
      headers: { "Content-Type": this.mediaType },
    });
  }
}

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

  async transform(resource) {
    for (const [condition, transform] of this.transforms) {
      if (!condition(resource)) continue;

      return transform(resource);
    }

    return resource;
  }
}
