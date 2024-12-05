#!/usr/bin/env node
import { program } from "commander";

import { serve } from "#src/actions/serve.js";
import { build } from "#src/actions/build.js";

program
  .name("ssg")
  .description("CLI to generate static websites with xylit-ssg")
  .version("0.0.1");

program
  .command("serve")
  .alias("")
  .option("-p, --port <number>", "port number", 8080)
  .action(serve);

program
  .command("build")
  .argument("[input]", "input directory")
  .argument("[output]", "output directory")
  .action(build);

program.parseAsync();
