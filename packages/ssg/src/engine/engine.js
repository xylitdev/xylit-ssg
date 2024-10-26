import { createReadStream } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { load } from "cheerio";
import mime from "mime";

import { Resource } from "../resource.js";
import { exec, kill } from "../runtime/runtime.js";
import { createStyleTransform } from "../transforms.js";

import config from "./config.js";
import Router from "./router.js";

export class Engine {
  transforms = [];

  constructor() {
    this.router = new Router();

    this.addTransform(
      ["text/x-scss", "text/x-sass", "text/css"],
      createStyleTransform({
        sass: config?.preprocessor?.sass,
        postcss: [],
      })
    );
  }

  addTransform(condition, transform) {
    const entry = [condition, transform];

    if (typeof condition === "string") {
      entry[0] = ({ mediaType }) => mediaType;
    } else if (Array.isArray(condition)) {
      entry[0] = ({ mediaType }) => condition.includes(mediaType);
    }

    this.transforms.unshift(entry);
  }

  async scan(root) {
    kill();
    await this.router.scan(root);
  }

  async generate(reqUrl) {
    const route = this.router.match(reqUrl);

    if (route) {
      const path = route.destination;
      const url = pathToFileURL(path);
      const { document, styles } = await exec(path, {
        route,
        lang: process.env.LANG,
      });

      const head = load(document)("head");
      styles.forEach(style => {
        head.append(`<style>${style.source}</style>`);
      });

      return new Resource({ contents: document, path, url });
    }
  }

  async transform(resource) {
    for (const [condition, transform] of this.transforms) {
      if (!condition(resource)) continue;

      return transform(resource);
    }

    return resource;
  }

  async getAsset(reqUrl) {
    if ([".sass", ".scss", ".css"].some(ext => reqUrl.endsWith(ext))) {
      const path = join(process.cwd(), reqUrl);
      const url = pathToFileURL(path);
      const contents = createReadStream(path);

      return new Resource({
        contents,
        path,
        url,
        mediaType: mime.getType(reqUrl),
      });
    }
  }
}
