import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import * as path from "node:path";

import { parse } from "acorn";
import * as walk from "acorn-walk";
import MagicString from "magic-string";

const injectImports = (source, ast) => {
  source.prepend(
    [
      'import * as Xylit from "@xylit/ssg";',
      "const { html, style } = Xylit.init(import.meta);",
      "export const meta = import.meta;",
      "",
    ].join("\n")
  );
};

const wrapDefaultExport = (source, ast) => {
  walk.simple(ast, {
    ExportDefaultDeclaration({ declaration: { start, end } }) {
      source.appendLeft(start, "Xylit.defineComponent(import.meta, () => (");
      source.appendRight(end, "));");
    },
  });
};

export async function resolve(specifier, context, nextResolve) {
  if (specifier == "xylit:config") {
    const realFile = path.resolve(process.cwd(), "xylit.config.js");
    const virtualFile = "data:text/javascript, export default {};";

    return stat(realFile)
      .then(() => nextResolve(realFile, context))
      .catch(() => nextResolve(virtualFile, context));
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, next) {
  if (!url.endsWith(".xylit")) return next(url, context);

  const path = fileURLToPath(url);
  const source = new MagicString(await readFile(path, { encoding: "utf-8" }));

  const ast = parse(source.toString(), {
    sourceType: "module",
    ecmaVersion: "latest",
  });

  injectImports(source, ast);
  wrapDefaultExport(source, ast);

  return {
    format: "module",
    shortCircuit: true,
    source: source.toString(),
  };
}
