import { register } from "node:module";
import { MessageChannel } from "node:worker_threads";

import { createCaller } from "#lib/remote-function";

import { createReadStream } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { load } from "cheerio";
import mime from "mime";

import config from "./config.js";
import { generate } from "./generating/document.js";
import Router from "./loading/router.js";
import { Resource } from "./processing/resource.js";

import {
  supportedMediaTypes,
  StyleProcessor,
} from "./processing/style-processor.js";

const { port1, port2 } = new MessageChannel();
const { call } = createCaller(port1);

register("./loading/loaders/dep-loader.js", {
  parentURL: import.meta.url,
  data: { port: port2, runtime: import.meta.url },
  transferList: [port2],
});

register("./loading/loaders/ssg-loader.js", import.meta.url);

export class Ssg {
  transforms = [];

  constructor() {
    this.router = new Router();

    const styleProcessor = new StyleProcessor(config.style);

    this.addTransform(supportedMediaTypes, resource =>
      styleProcessor.process(resource)
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
    await this.router.scan(root);
  }

  async generate(reqUrl) {
    const route = this.router.match(reqUrl);

    if (!route) return;

    const path = route.destination;
    const url = pathToFileURL(path);

    const { default: Component, __SSG } = await import(path);

    __SSG.setContext({
      route,
      lang: process.env.LANG,
    });

    const result = await Component();
    const { dom, styles } = await generate(result);

    const head = load(dom)("head");
    styles.forEach(style => {
      head.append(`<style>${style.contents}</style>`);
    });

    return new Resource({ contents: dom, path, url });
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

export async function invalidate(...urls) {
  return call("invalidate", ...urls);
}
