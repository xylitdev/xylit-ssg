import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export const write = async (path, content) => {
  const dir = dirname(path);

  await mkdir(dir, { recursive: true });
  await writeFile(path, content, { encoding: "utf-8" });
};

export default class Pipeline {
  async process(src, dest, source) {
    await write(dest, source);
  }
}
