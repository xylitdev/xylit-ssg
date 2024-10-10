import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import * as path from "node:path";

import { compile } from "../compiler.js";

export async function resolve(specifier, context, nextResolve) {
  if (specifier == "ssg:config") {
    const realFile = path.resolve(process.cwd(), "ssg.config.js");
    const virtualFile = "data:text/javascript, export default {};";

    return stat(realFile)
      .then(() => nextResolve(realFile, context))
      .catch(() => nextResolve(virtualFile, context));
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, next) {
  if (!url.endsWith(".ssg.js")) return next(url, context);

  const path = fileURLToPath(url);

  return {
    format: "module",
    shortCircuit: true,
    source: await compile(path),
  };
}
