export function remove(set, condition) {
  for (const item of set) {
    if (condition(item)) {
      set.delete(item);
      return item;
    }
  }
}
