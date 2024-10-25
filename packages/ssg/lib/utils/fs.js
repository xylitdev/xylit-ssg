import { lstat } from "node:fs/promises";

export const fileExists = path =>
  lstat(path)
    .then(stat => stat.isFile())
    .catch(() => false);
