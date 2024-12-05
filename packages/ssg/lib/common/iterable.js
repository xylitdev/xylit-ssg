export function findMapLast(iterable, fn) {
  const item = [...iterable].findLast(fn);

  if (item != null) {
    return fn(item);
  }
}
