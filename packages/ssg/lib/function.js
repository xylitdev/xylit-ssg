export function memoize(fn, options) {
  const resolve = options?.resolve ?? (firstArg => firstArg);
  const cache = new WeakMap();

  return (...args) => {
    const key = resolve(args[0]);

    if (cache.has(key)) return cache.get(key);

    const value = fn(...args);
    cache.set(key, value);

    return value;
  };
}
