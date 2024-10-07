import { readdir } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

import { get, set, unset, until, isString } from "./utils/common.js";

export default class Router {
  #config;
  #rootDir;
  #root;

  constructor(conf) {
    this.#rootDir = process.cwd();
    this.#config = {
      indices: [conf?.index ?? "index.xylit"].flat(),
      types: [conf?.type ?? ".xylit"].flat(),
    };
  }

  link(file) {
    const { types } = this.#config;
    const relativePath = relative(this.#rootDir, file);

    if (
      !relativePath ||
      relativePath.startsWith("..") ||
      !types.some(type => relativePath.endsWith(type))
    ) {
      return false;
    }

    const segments = relativePath.split(sep);
    set(this.#root, segments, file);

    return true;
  }

  unlink(file) {
    const segments = relative(this.#rootDir, file).split(sep);
    unset(this.#root, segments);
  }

  async scan(rootDir = this.#rootDir) {
    this.#rootDir = rootDir;
    this.#root = {};

    const dirents = await readdir(rootDir, {
      recursive: true,
      withFileTypes: true,
    });

    dirents.forEach(dirent => {
      if (!dirent.isFile()) return;

      const file = resolve(dirent.parentPath, dirent.name);
      this.link(file);
    });
  }

  entries() {
    const entries = [];
    const nodes = [["", this.#root]];

    while (nodes.length) {
      const [path, node] = nodes.shift();

      for (const key in node) {
        const value = node[key];
        const route = path ? `${path}/${key}` : key;

        if (typeof value === "string") {
          entries.push([route, value]);
        } else {
          nodes.push([route, value]);
        }
      }
    }

    return entries;
  }

  match(path) {
    const url = new URL(path, "file://");

    const segments = url.pathname
      .trim()
      .split("/")
      .filter(segment => segment !== "");

    if (!url.pathname.endsWith("/")) {
      const name = segments.at(-1);
      const rest = segments.slice(0, -1);

      const node = until(
        ext => get(this.#root, [...rest, `${name}${ext}`]),
        this.#config.types
      );

      if (isString(node)) return node;
    }

    const node = until(
      name => get(this.#root, [...segments, name]),
      this.#config.indices
    );

    if (isString(node)) return node;
  }
}
