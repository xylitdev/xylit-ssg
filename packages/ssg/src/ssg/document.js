import { load } from "cheerio";

import { Resource } from "./resource.js";

export class Document extends Resource {
  constructor(dom) {
    super({ contents: dom, mediaType: "text/html" });
  }

  get contents() {
    return this.$.html();
  }

  set contents(dom) {
    this.$ = load(dom);
  }

  mount(...assets) {
    const head = this.$("head");

    for (const asset of assets) {
      if (asset instanceof Resource) {
        head.append(`<style>${asset.contents}</style>`);
      } else {
        head.append(asset);
      }
    }
  }
}
