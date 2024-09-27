import { readdir } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

import { get, set, unset, until, isString } from "./utils/common.js";

export const createStaticRoutingStrategy = ({ index, type }) => {
  return (root, path) => {
    const segments = path
      .trim()
      .split("/")
      .filter(segment => segment !== "");

    if (!path.endsWith("/")) {
      const name = segments.at(-1);
      const rest = segments.slice(0, -1);
      const node = until(ext => get(root, [...rest, `${name}${ext}`]), type);

      if (isString(node)) return node;
    }

    const node = until(name => get(root, [...segments, name]), index);

    if (isString(node)) return node;
  };
};

export default class FileSystemRouter {
  #config;
  #match;
  #root;

  constructor(config) {
    this.#config = {
      path: config?.path ?? process.cwd(),
      strategy: config?.strategy ?? createStaticRoutingStrategy,
      index: [config?.index ?? "index.html"].flat(),
      type: [config?.type ?? ".html"].flat(),
    };

    this.#match = this.#config.strategy(this.#config);
  }

  match(path) {
    const url = new URL(path, "file://");

    return this.#match(this.#root, url.pathname);
  }

  async scan(path = this.#config.path) {
    this.#config.path = path;
    this.#root = {};

    const dirents = await readdir(path, {
      recursive: true,
      withFileTypes: true,
    });

    dirents
      .filter(f => f.isFile())
      .forEach(dirent => {
        const relativePath = relative(path, dirent.parentPath);
        const segments = relativePath ? relativePath.split(sep) : [];

        set(
          this.#root,
          [...segments, dirent.name],
          resolve(dirent.parentPath, dirent.name)
        );
      });
  }

  add(path) {
    const relativePath = relative(this.#config.path, path);
    const segments = relativePath.split(sep);

    set(this.#root, segments, resolve(this.#config.path, relativePath));
  }

  unlink(path) {
    const segments = relative(this.#config.path, path).split(sep);

    unset(this.#root, segments);
  }
}
