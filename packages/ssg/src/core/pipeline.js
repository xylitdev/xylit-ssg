import { remove } from "#lib/common/set.js";

import { Resource } from "./resource.js";

export function createPipeline(...processors) {
  return {
    async transform(resource, options) {
      const unused = new Set(processors);

      while (unused.size) {
        const processor = remove(unused, p => p.condition(resource));

        if (!processor) break;

        const opts = options?.[processor.id];
        const tf = await processor.transform(resource, opts);
        resource = new Resource({ ...resource, ...tf, virtual: true });

        if (tf.shortCircuit) break;
      }

      return resource;
    },
  };
}
