import { parse } from "acorn";
import * as walk from "acorn-walk";
import MagicString from "magic-string";

const fnTypes = ["ArrowFunctionExpression", "FunctionDeclaration"];

const injectImports = (source, ast) => {
  source.prepend(
    [
      'import { initialize as __initializeSSG } from "@xylit/ssg/runtime";',
      "const __SSG = __initializeSSG(import.meta);",
      "const { html, style } = __SSG",
      "",
    ].join("\n")
  );
};

const wrapDefaultExport = (source, ast) => {
  walk.simple(ast, {
    ExportDefaultDeclaration({ declaration: { type, start, end } }) {
      if (fnTypes.includes(type)) {
        source.appendLeft(start, "__SSG.createComponent(");
        source.appendRight(end, ");");
      } else {
        source.appendLeft(start, "__SSG.createComponent(() => (");
        source.appendRight(end, "));");
      }
    },
  });
};

const compile = async source => {
  source = new MagicString(source);

  const ast = parse(source.toString(), {
    sourceType: "module",
    ecmaVersion: "latest",
  });

  injectImports(source, ast);
  wrapDefaultExport(source, ast);

  return source.toString();
};

export async function load(urlStr, context, next) {
  const url = new URL(urlStr);
  const result = await next(urlStr, context);

  if (!url.pathname.endsWith(".ssg.js")) return result;

  return {
    format: "module",
    shortCircuit: true,
    source: await compile(result.source.toString()),
  };
}
