#!/usr/bin/env node

import { serve, build } from "@xylit/ssg/api";
import { program } from "commander";

program
  .name("ssg")
  .description("CLI to generate static websites with xylit-ssg")
  .version("0.0.1");

program
  .command("serve")
  .alias("")
  .option("-p, --port <number>", "port number", 8080)
  .action(async ({ port }) => {
    await serve();
  });

program
  .command("build")
  .argument("[input]")
  .action(async () => {
    await build();
    process.exit();
  });

program.parse();
