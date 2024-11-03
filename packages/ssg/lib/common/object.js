export function remove(obj, fn) {
  const removed = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (fn(key, value, obj)) {
      removed[key] = obj[key];
      delete obj[key];
    }
  });

  return removed;
}
