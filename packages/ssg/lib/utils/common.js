export const isArray = any => Array.isArray(any);

export const isBoolean = any => typeof any === "boolean";

export const isFunction = any => typeof any === "function";

export const isNullish = any => any == null;

export const isObject = obj =>
  null !== obj &&
  typeof obj === "object" &&
  Object.getPrototypeOf(obj).isPrototypeOf(Object);

export const isString = file => typeof file === "string";

export const defaults = (obj, defaultValues) => {
  const result = { ...defaultValues };

  Object.entries({ ...obj }).forEach(([key, value]) => {
    if (value === undefined) return;

    result[key] = value;
  });

  return result;
};

export const get = (root, segments) => {
  let entry = root;
  for (const segment of segments) {
    entry = entry?.[segment];
  }

  return entry;
};

export const set = (root, segments, value) => {
  const lastSegment = segments.pop();

  let entry = root;
  for (const segment of segments) {
    entry = entry[segment] ||= {};
  }

  entry[lastSegment] = value;
};

export const pick = (obj, ...paths) => {
  const picked = {};

  for (const path of paths) {
    picked[path] = obj?.[path];
  }

  return picked;
};

export const unset = (root, segments) => {
  const name = segments.pop();

  let node = root;
  for (const segment of segments) {
    node = node[segment] ||= {};
  }

  delete node[name];
};

export const until = (transformation, items) => {
  for (const item of items) {
    const result = transformation(item);

    if (result) return result;
  }
};

export const monkeyPatch = (obj, methods) => {
  Object.entries(methods).forEach(([name, method]) => {
    const orig = obj?.[name]?.bind?.(obj) || (() => {});
    obj[name] = (...args) => method(orig, ...args);
  });

  return obj;
};

export const raw = (raw, ...values) => String.raw({ raw }, ...values);

export const defineGetters = (obj, props) => {
  const entries = Object.entries(props).map(([key, handler]) => [
    key,
    {
      get() {
        return handler(this);
      },
    },
  ]);

  return Object.defineProperties(obj, Object.fromEntries(entries));
};

export function createURL(url, modifier) {
  url = Object.assign(new URL(url), modifier);

  return url;
}

export function debounce(method, ms, opts) {
  let timeoutId;
  let aggregated = [];

  return (...args) => {
    clearTimeout(timeoutId);

    if (opts?.aggregate) {
      aggregated.push(args);
    }

    timeoutId = setTimeout(() => {
      if (opts?.aggregate) {
        method(aggregated);
        aggregated = [];
      } else {
        method(...args);
      }
    }, ms);
  };
}
