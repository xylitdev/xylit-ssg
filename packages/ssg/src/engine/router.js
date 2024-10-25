import { readdir } from "node:fs/promises";
import { basename, relative, resolve, sep } from "node:path";

import { set, unset } from "#utils/common";

export default class Router {
  #conf;
  #entries;

  constructor(conf) {
    this.#entries = {};
    this.#conf = {
      root: conf?.root ?? resolve(process.cwd(), "pages"),
      indices: [conf?.index ?? "index.ssg.js"].flat(),
      types: [conf?.type ?? ".ssg.js"].flat(),
      ignore: conf?.ignore ?? (name => name.startsWith("_")),
    };
  }

  link(file) {
    const { types } = this.#conf;
    const relativePath = relative(this.#conf.root, file);

    if (
      !relativePath ||
      relativePath.startsWith("..") ||
      !types.some(type => relativePath.endsWith(type))
    ) {
      return false;
    }

    const segments = relativePath.split(sep);
    set(this.#conf.root, segments, file);

    return true;
  }

  unlink(file) {
    const segments = relative(this.#conf.root, file).split(sep);
    unset(this.#conf.root, segments);
  }

  isIndex(name) {
    return this.#conf.indices.some(index => name.endsWith(index));
  }

  async scan(root = this.#conf.root) {
    this.#conf.root = root;
    this.#entries = {};

    const dirs = [root];

    while (dirs.length) {
      const dir = dirs.shift();
      const dirents = await readdir(dir, { withFileTypes: true });

      for (const dirent of dirents) {
        if (this.#conf?.ignore?.(dirent.name)) continue;

        const path = resolve(dirent.parentPath, dirent.name);

        if (dirent.isDirectory()) {
          dirs.push(path);
        } else if (this.#conf.types.some(ext => dirent.name.endsWith(ext))) {
          const ext = this.#conf.types.find(type => path.endsWith(type));
          const relativePath = relative(root, path);
          const segments = relativePath.split(sep);
          const name = segments.pop();
          const base = this.isIndex(name) ? "" : basename(name, ext);
          const pattern = ["", ...segments, base].join("/");

          this.#entries[pattern] = {
            pattern,
            destination: path,
          };
        }
      }
    }
  }

  entries() {
    return Object.entries(this.#entries);
  }

  match(reqUrl) {
    const url = new URL(reqUrl, "file://");
    const path = url.pathname.replace(/^\/(.*)\/$/, "/$1");
    const entry = this.#entries[path];

    if (entry) {
      return { ...entry, path };
    }
  }
}
