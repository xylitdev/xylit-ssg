export function monkeyPatch(obj, methods) {
  Object.entries(methods).forEach(([name, method]) => {
    const orig = obj?.[name]?.bind?.(obj) || (() => {});
    obj[name] = (...args) => method(orig, ...args);
  });

  return obj;
}

export function defineGetters(obj, props) {
  const entries = Object.entries(props).map(([key, handler]) => [
    key,
    {
      get() {
        return handler(this);
      },
    },
  ]);

  return Object.defineProperties(obj, Object.fromEntries(entries));
}
