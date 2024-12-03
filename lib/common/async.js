export async function concurrent(iterable, fn) {
  const promises = [];

  for (const item of iterable) {
    promises.push(fn(item));
  }

  await Promise.all(promises);
}
