import { fileURLToPath } from "node:url";

import { compileAsync, compileStringAsync } from "sass";

export function createSassProcessor(options) {
  return {
    condition: r => ["text/x-scss", "text/x-sass"].includes(r.mediaType),
    async transform(resource) {
      let result;

      if (resource.virtual) {
        const source = await resource.text();
        result = await compileStringAsync(source, options);
      } else {
        const path = fileURLToPath(resource.url);
        result = await compileAsync(path, options);
      }

      return {
        mediaType: "text/css",
        contents: [result.css],
      };
    },
  };
}
