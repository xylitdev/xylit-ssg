import { fork } from "node:child_process";
import { createHash } from "node:crypto";
import EventEmitter from "node:events";
import { register } from "node:module";
import { fileURLToPath } from "node:url";

import { parse } from "node-html-parser";

import { createHtmlLiteral } from "./literals/html.js";
import { createStyleApi } from "./literals/style.js";

import { isFunction, isObject } from "./utils/common.js";

if (!import.meta.registered) {
  register("./loaders/ssg-loader.js", import.meta.url);
  import.meta.registered = true;
}

const eventEmitter = new EventEmitter();

const createSlotApi = slots => {
  const slot = (...args) => slot["default"]?.(...args);

  Object.entries(slots).forEach(([name, content]) => {
    slot[name] = isFunction(content) ? content : () => content;
  });

  return slot;
};

export const context = {
  lang: process.env.LANG,
};

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

export const emit = (eventName, ...args) =>
  eventEmitter.emit(eventName, ...args);

export const on = (eventName, listener, options) => {
  return options?.once
    ? eventEmitter.once(eventName, listener)
    : eventEmitter.on(eventName, listener);
};

export const off = (eventName, listener) =>
  eventEmitter.off(eventName, listener);

export const defineComponent = (meta, guard) => {
  return async (properties, ...children) => {
    const template = guard();

    const props = { ...properties };
    const slot =
      children.length === 1
        ? isObject(children[0])
          ? createSlotApi(children[0])
          : createSlotApi({ default: children[0] })
        : createSlotApi({ default: children.flat() });

    const result = isFunction(template)
      ? template({ ...context, props, slot })
      : template;

    emit("component:render", { meta });

    return result;
  };
};

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

process.on("message", async ({ path, context: ctx }) => {
  const { default: Component } = await import(path);

  const styles = [];
  Object.assign(context, ctx);

  const onRender = ({ meta }) => {
    styles.push(...meta.styleDefinitions);
  };

  on("component:render", onRender);

  Component().then(async content => {
    off("component:render", onRender);

    process.send({
      content,
      styles: await Promise.all(styles),
    });
  });
});
