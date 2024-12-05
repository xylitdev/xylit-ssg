import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { pipeline } from "node:stream/promises";

export async function write(path, contents) {
  await mkdir(dirname(path), { recursive: true });
  await pipeline(contents, createWriteStream(path));
}
