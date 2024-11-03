export function transform(obj, fn, initial = obj.constructor()) {
  return Object.entries(obj).reduce(
    (prev, [key, value]) => fn(prev, key, value, initial) ?? prev,
    initial
  );
}
