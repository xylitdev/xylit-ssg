export const isArray = Array.isArray;

export function isBoolean(value) {
  return typeof value === "boolean";
}

export function isFunction(value) {
  return typeof value === "function";
}

export function isNullish(value) {
  return value == null;
}

export function isObject(value) {
  return (
    null !== value &&
    typeof value === "object" &&
    Object.getPrototypeOf(value).isPrototypeOf(Object)
  );
}

export function isString(value) {
  return typeof value === "string";
}

export function isThenable(value) {
  return typeof value?.then === "function";
}
