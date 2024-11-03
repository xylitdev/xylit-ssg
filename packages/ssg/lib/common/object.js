export function defaults(obj, defaultValues) {
  const result = { ...defaultValues };

  Object.entries({ ...obj }).forEach(([key, value]) => {
    if (value === undefined) return;

    result[key] = value;
  });

  return result;
}

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
