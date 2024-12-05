export async function createSassProcessor(options) {
  return import("sass")
    .then(({ compileAsync, compileStringAsync }) => ({
      condition: r => ["text/x-scss", "text/x-sass"].includes(r.mediaType),
      async transform(resource) {
        let result;

        if (resource.virtual) {
          const source = await resource.text();
          result = await compileStringAsync(source, options);
        } else {
          result = await compileAsync(resource.path, options);
        }

        return {
          path: resource?.path?.replace?.(/\.(scss|sass)/, ".css"),
          mediaType: "text/css",
          contents: [result.css],
        };
      },
    }))
    .catch(() => {
      console.info("INFO: sass processing disabled. No Processor available.");
    });
}
