import { join } from "node:path";
import { program } from "commander";

import * as api from "./api.js";
import { setConfig } from "./ssg.js";
import { configPath, setConfigPath } from "./processor.js";

setConfigPath(join(process.cwd(), "xylit.config.js"));

program
  .name("ssg")
  .description("CLI to generate static websites with xylit-ssg")
  .version("0.0.1")
  .option("--serve", "run the dev server")
  .option("--build", "generate the website")
  .action(async ({ serve, build }) => {
    const { default: config } = await import(configPath).catch(() => ({}));

    setConfig(config);

    if (serve) {
      await api.serve(config);
    } else if (build) {
      await api.build(config);
      process.exit();
    }
  })
  .parse();
