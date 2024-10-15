import { fork } from "node:child_process";
import { createHash } from "node:crypto";
import { register } from "node:module";
import { fileURLToPath } from "node:url";

import { parse } from "node-html-parser";

import { createHtmlLiteral } from "./literals/html.js";
import { createStyleApi } from "./literals/style.js";

import { createComponent } from "./component.js";

if (!import.meta.registered) {
  register("./loaders/ssg-loader.js", import.meta.url);
  import.meta.registered = true;
}

export const init = meta => {
  meta.styleDefinitions = [];
  meta.urlHash = createHash("shake256", { outputLength: 5 })
    .update(meta.url)
    .digest("hex");

  return {
    html: createHtmlLiteral(meta),
    style: createStyleApi(meta),
  };
};

export const defineComponent = createComponent;

let childProcess;

export const kill = () => {
  childProcess?.kill?.();
  childProcess = undefined;
};

export const exec = async (path, context) => {
  if (!childProcess) {
    const path = fileURLToPath(import.meta.url);
    childProcess = fork(path, { silent: false, detached: true });
  }

  return new Promise((resolve, reject) => {
    childProcess.on("message", ({ content, styles }) => {
      resolve({
        doc: parse(content),
        styles,
      });
    });

    childProcess.on("exit", reject);
    childProcess.send({ path, context });
  });
};

process.on("message", async ({ path, context }) => {
  const { default: Component } = await import(path);

  Object.assign(Component, context);

  const result = await Component();
  process.send(result);
});
