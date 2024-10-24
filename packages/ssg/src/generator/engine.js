import { join } from "node:path";

import { exec, kill } from "../runtime.js";

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
      return exec(route.destination, {
        route,
        lang: process.env.LANG,
      });
    }
  }

  async getAsset(reqUrl) {
    if ([".sass", ".scss", ".css"].some(ext => reqUrl.endsWith(ext))) {
      const src = join(process.cwd(), reqUrl);

      return { src };
    }
  }
}
