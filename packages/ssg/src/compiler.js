import { readFile } from "node:fs/promises";

import { parse } from "acorn";
import * as walk from "acorn-walk";
import MagicString from "magic-string";

const injectImports = (source, ast) => {
  source.prepend(
    [
      'import * as SSG from "@xylit/ssg/runtime";',
      "const { html, style } = SSG.init(import.meta);",
      "export const meta = import.meta;",
      "",
    ].join("\n")
  );
};

const wrapDefaultExport = (source, ast) => {
  walk.simple(ast, {
    ExportDefaultDeclaration({ declaration: { start, end } }) {
      source.appendLeft(start, "SSG.defineComponent(import.meta, () => (");
      source.appendRight(end, "));");
    },
  });
};

export const compile = async path => {
  const source = new MagicString(await readFile(path, { encoding: "utf-8" }));

  const ast = parse(source.toString(), {
    sourceType: "module",
    ecmaVersion: "latest",
  });

  injectImports(source, ast);
  wrapDefaultExport(source, ast);

  return source.toString();
};
