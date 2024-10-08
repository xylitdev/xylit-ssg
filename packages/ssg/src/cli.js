import config from "xylit:config";

import { program } from "commander";

import * as api from "./api.js";

program
  .name("ssg")
  .description("CLI to generate static websites with xylit-ssg")
  .version("0.0.1");

program
  .command("dev")
  .alias("")
  .option("-p, --port <number>", "port number", 8080)
  .action(async ({ port }) => {
    await api.serve(config);
  });

program
  .command("build")
  .argument("[input]")
  .action(async () => {
    await api.build(config);
    process.exit();
  });

program.parse();
