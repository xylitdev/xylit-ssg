import { isFunction, isObject } from "./utils/common.js";

const createSlotApi = slots => {
  const slot = (...args) => slot["default"]?.(...args);

  Object.entries(slots).forEach(([name, content]) => {
    slot[name] = isFunction(content) ? content : () => content;
  });

  return slot;
};

export { default as createHtmlLiteral } from "./literals/html.js";

export const context = {};

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
