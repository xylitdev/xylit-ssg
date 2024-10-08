#!/usr/bin/env node

import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";

const [nodeBin, module, ...args] = process.argv;
const path = fileURLToPath(import.meta.resolve("../src/cli.js"));

fork(path, args, {
  execArgv: [
    ...process.execArgv,
    "--import",
    "@xylit/ssg/loaders/_register.js",
  ],
}).once("close", process.exit);
