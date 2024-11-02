import { isObject, isFunction } from "#lib/common";

import { html } from "./literals.js";

const contexts = [];

const childrenToSlots = children => {
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
};

export const createContext = description => {
  const identifier = Symbol(description);

  const provide = ctx => {
    Object.assign(contexts.at(-1), { [identifier]: ctx });
  };

  const inject = () => contexts.at(-1)?.[identifier];

  return [provide, inject];
};

export function createComponent({ scope, styles, template, context }) {
  return async function render(properties, ...children) {
    const props = { ...properties };
    const slot = childrenToSlots(children);
    const ctx = { ...contexts.at(-1), ...(context?.() || context) };

    contexts.push(ctx);
    const result = await template({ ...ctx, props, slot });
    contexts.pop();

    return Object.assign(html`${result}`, { scope, styles });
  };
}
