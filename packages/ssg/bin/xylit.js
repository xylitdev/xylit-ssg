#!/usr/bin/env node

import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";

// Get the node binary, file, and non-node arguments that we ran with
const [nodeBin, module, ...args] = process.argv;
const path = fileURLToPath(import.meta.resolve("../src/cli.js"));

// Re-running with esbuild-register loader
fork(path, args, {
  execArgv: [
    // Get the arguments passed to the node binary
    ...process.execArgv,
    // Pass more arguments to node binary as desired
    "--import",
    "@xylit/ssg/loaders/_register.js",
  ],
}).once("close", process.exit);
