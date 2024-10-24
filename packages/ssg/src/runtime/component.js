import EventEmitter from "node:events";

import { isObject, isFunction } from "@xylit/ssg/lib/common";

const contexts = [];
const emitter = new EventEmitter();

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

const on = (eventName, listener, options) => {
  return options?.once
    ? emitter.once(eventName, listener)
    : emitter.on(eventName, listener);
};

const off = (eventName, listener) => emitter.off(eventName, listener);

export const createContext = description => {
  const identifier = Symbol(description);

  const provide = ctx => {
    Object.assign(contexts.at(-1), { [identifier]: ctx });
  };

  const inject = () => contexts.at(-1)?.[identifier];

  return [provide, inject];
};

export const createComponent = (meta, guard) => {
  const render = async (properties, ...children) => {
    const props = { ...properties };
    const slot = childrenToSlots(children);
    const ctx = { ...contexts.at(-1), ...render };
    const styles = new Set();

    const collectStyles = ({ styleDefinitions }) => {
      styleDefinitions.forEach(style => styles.add(style));
    };

    on("rendered", collectStyles);
    contexts.push(ctx);
    emitter.emit("beforeRender", meta);

    const template = guard();
    const result = isFunction(template)
      ? await template({ ...ctx, props, slot })
      : await template;

    emitter.emit("rendered", meta);
    contexts.pop();
    off("rendered", collectStyles);

    return {
      type: "ComponentResult",
      content: result?.content || result,
      styles: await Promise.all([...styles]),
    };
  };

  return render;
};
