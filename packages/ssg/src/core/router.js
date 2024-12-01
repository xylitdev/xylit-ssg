import { readdir } from "node:fs/promises";
import { join } from "node:path";

export function createRouter({ input, lang, base }) {
  function createUrl(urlLike) {
    const url = new URL(urlLike, base);
    url.pathname = url.pathname.replace(/\/$/, "");

    console.log(url.pathname);

    return url;
  }

  function matchingPaths(url) {
    const urlPath = decodeURI(url.pathname);

    return [
      join(input, urlPath),
      join(input, `${urlPath}.ssg.js`),
      join(input, urlPath, "index.ssg.js"),
    ];
  }

  async function* walkFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const path = join(dirent.parentPath, dirent.name);

      if (dirent.isDirectory()) {
        yield* walkFiles(path);
      } else if (dirent.isFile()) {
        yield path;
      }
    }
  }

  return {
    async match(urlLike) {
      const url = createUrl(urlLike);

      if (!url) return;

      const matches = matchingPaths(url);
      for await (const path of walkFiles(input)) {
        if (matches.includes(path)) {
          return { path, url, lang };
        }
      }
    },
  };
}
