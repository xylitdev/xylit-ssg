import { createHash } from "node:crypto";
import EventEmitter from "node:events";

import { createHtmlLiteral } from "./literals/html.js";
import { createStyleApi } from "./literals/style.js";

import { isFunction, isObject } from "./utils/common.js";

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
