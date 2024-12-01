import { isObject, isFunction } from "#lib/common/type.js";

import { html } from "./literals.js";

const contexts = [];

function childrenToSlots(children) {
  const slots =
    children.length === 1
      ? isObject(children[0])
        ? children[0]
        : { default: children[0] }
      : { default: children.flat() };

  const slot = (...args) => slot["default"]?.(...args);

  Object.entries(slots).forEach(([name, content]) => {
    slot[name] = isFunction(content) ? content : () => content;
  });

  return slot;
}

function extractPropsAndContext(properties) {
  const context = { ...contexts.at(-1), ...properties?.[__Context] };
  const props = { ...properties };
  delete props[__Context];

  return [props, context];
}

export const __Context = Symbol("Context");

export function createContext(description) {
  const identifier = Symbol(description);

  const provide = ctx => {
    Object.assign(contexts.at(-1), { [identifier]: ctx });
  };

  const inject = () => contexts.at(-1)?.[identifier];

  return [provide, inject];
}

export function createComponent({ scope, style, template }) {
  return async (properties, ...children) => {
    const [props, context] = extractPropsAndContext(properties);
    const slots = childrenToSlots(children);

    contexts.push(context);
    const result = await template(props, slots, context);
    contexts.pop();

    return Object.assign(html`${result}`, { scope, styles: [style].flat() });
  };
}
