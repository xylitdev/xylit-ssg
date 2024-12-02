import { createGenerator } from "#src/core/generator.js";
import { createPipeline } from "#src/core/pipeline.js";
import { createRouter } from "#src/core/router.js";
import { createCssProcessor } from "#src/processors/css-processor.js";
import { createSassProcessor } from "#src/processors/sass-processor.js";

export function setup(config) {
  const { transform } = createPipeline(
    createSassProcessor(config.style.sass),
    createCssProcessor()
  );

  const { generate, isTemplate } = createGenerator(transform);

  const router = createRouter({
    input: config.input,
    base: "http://localhost",
    lang: process.env.LANG,
  });

  return {
    isTemplate,
    generate,
    router,
    transform,
  };
}
