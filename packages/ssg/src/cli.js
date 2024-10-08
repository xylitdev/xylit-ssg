import { join } from "node:path";
import { program } from "commander";

import * as api from "./api.js";
import { setConfig } from "./ssg.js";
import { configPath, setConfigPath } from "./processor.js";

program
  .name("ssg")
  .description("CLI to generate static websites with xylit-ssg")
  .version("0.0.1");

program
  .command("dev")
  .alias("")
  .option("-p, --port <number>", "port number", 8080)
  .action(async ({ port }) => {
    setConfigPath(join(process.cwd(), "xylit.config.js"));
    const { default: config } = await import(configPath).catch(() => ({}));
    setConfig(config);

    await api.serve(config);
  });

program
  .command("build")
  .argument("[input]")
  .action(async () => {
    setConfigPath(join(process.cwd(), "xylit.config.js"));
    const { default: config } = await import(configPath).catch(() => ({}));
    setConfig(config);

    await api.build(config);
    process.exit();
  });

program.parse();
