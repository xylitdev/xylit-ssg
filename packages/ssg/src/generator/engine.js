import { join } from "node:path";
import { load } from "cheerio";

import { exec, kill } from "#runtime";

import Router from "./router.js";

export class Engine {
  constructor() {
    this.router = new Router();
  }

  async scan(root) {
    kill();
    await this.router.scan(root);
  }

  async generate(reqUrl) {
    const route = this.router.match(reqUrl);

    if (route) {
      const { document, styles } = await exec(route.destination, {
        route,
        lang: process.env.LANG,
      });

      const head = load(document)("head");
      styles.forEach(style => {
        head.append(`<style>${style.source}</style>`);
      });

      return { contents: document };
    }
  }

  async getAsset(reqUrl) {
    if ([".sass", ".scss", ".css"].some(ext => reqUrl.endsWith(ext))) {
      const src = join(process.cwd(), reqUrl);

      return { src };
    }
  }
}
