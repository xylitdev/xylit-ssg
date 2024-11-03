export function aggregate(fn, ms) {
  let timeoutId;
  let aggregated = [];

  return (...args) => {
    clearTimeout(timeoutId);
    aggregated.push(args);

    timeoutId = setTimeout(() => {
      const arg = aggregated;
      aggregated = [];
      fn(arg);
    }, ms);
  };
}

export function debounce(fn, ms) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn(...args);
    }, ms);
  };
}

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
