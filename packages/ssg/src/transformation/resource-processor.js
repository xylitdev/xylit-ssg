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
