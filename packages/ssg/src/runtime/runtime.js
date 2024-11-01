import { fork } from "node:child_process";
import { createHash } from "node:crypto";
import { register } from "node:module";
import { fileURLToPath } from "node:url";
import { MessageChannel } from "node:worker_threads";

import { parseDocument } from "htmlparser2";

import { createURL } from "#lib/common";
import { createCaller } from "#lib/remote-function";

import { createHtmlLiteral } from "./html.js";
import { createStyleApi } from "./style.js";
import { createComponent } from "./component.js";

let childProcess;
const { port1, port2 } = new MessageChannel();
const { call } = createCaller(port1);

register("./loaders/dep-loader.js", {
  parentURL: import.meta.url,
  data: { port: port2, runtime: import.meta.url },
  transferList: [port2],
});

register("./loaders/ssg-loader.js", import.meta.url);

export async function invalidate(...urls) {
  return call("invalidate", ...urls);
}

export const init = meta => {
  meta.styleDefinitions = [];
  meta.urlHash = createHash("shake256", { outputLength: 5 })
    .update(createURL(meta.url, { search: "" }).toString())
    .digest("hex");

  return {
    html: createHtmlLiteral(meta),
    style: createStyleApi(meta),
    createComponent: createComponent.bind(undefined, meta),
  };
};

export const exec = async (path, context) => {
  if (!childProcess) {
    const path = fileURLToPath(import.meta.url);
    childProcess = fork(path, { silent: false, detached: true });
  }

  return new Promise((resolve, reject) => {
    childProcess.on("message", ({ content, styles }) => {
      resolve({
        document: parseDocument(content),
        styles,
      });
    });

    childProcess.on("exit", reject);
    childProcess.send({ path, context });
  });
};

export const execHot = async (path, context) => {
  const { default: Component } = await import(path);

  Object.assign(Component, context);
  const { content, styles } = await Component();

  return {
    document: parseDocument(content),
    styles,
  };
};

export const kill = () => {
  childProcess?.kill?.();
  childProcess = undefined;
};

process.on("message", async ({ path, context }) => {
  const { default: Component } = await import(path);
  Object.assign(Component, context);
  const result = await Component();
  process.send(result);
});
