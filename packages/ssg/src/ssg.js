import { createHash } from "node:crypto";

import { createHtmlLiteral } from "./literals/html.js";
import { createStyleLiteral, styles } from "./literals/style.js";

import { isFunction, isObject } from "./utils/common.js";

const createSlotApi = slots => {
  const slot = (...args) => slot["default"]?.(...args);

  Object.entries(slots).forEach(([name, content]) => {
    slot[name] = isFunction(content) ? content : () => content;
  });

  return slot;
};

export const init = meta => {
  meta.styleDefinitions = [];
  meta.urlHash = createHash("shake256", { outputLength: 5 })
    .update(meta.url)
    .digest("hex");

  styles.set(meta.url, meta.styleDefinitions);

  return {
    html: createHtmlLiteral(meta),
    style: createStyleLiteral(meta),
  };
};

export const context = {
  lang: process.env.LANG,
};

export const defineComponent = (meta, guard) => {
  return (properties, ...children) => {
    const template = guard();

    const props = { ...properties };
    const slot =
      children.length === 1
        ? isObject(children[0])
          ? createSlotApi(children[0])
          : createSlotApi({ default: children[0] })
        : createSlotApi({ default: children.flat() });

    return isFunction(template)
      ? template({ ...context, props, slot })
      : template;
  };
};
