export async function partition(iterable, condition) {
  const satisfied = [];
  const violated = [];

  for await (const item of iterable) {
    if (condition(item)) {
      satisfied.push(item);
    } else {
      violated.push(item);
    }
  }

  return [satisfied, violated];
}
