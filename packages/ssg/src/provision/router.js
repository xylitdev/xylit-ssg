import { readdir } from "node:fs/promises";
import { basename, relative, resolve, sep } from "node:path";

import { remove } from "#lib/common/object";

export class Router {
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

  link(...paths) {
    for (const path of paths) {
      const ext = this.#conf.types.find(type => path.endsWith(type));
      const relativePath = relative(this.#conf.root, path);
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

  unlink(...paths) {
    for (const path of paths) {
      remove(this.#entries, (pattern, { destination }) => destination === path);
    }
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
          this.link(path);
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
