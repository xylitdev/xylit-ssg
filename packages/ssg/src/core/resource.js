import { text } from "node:stream/consumers";

export class Resource {
  constructor(options) {
    Object.assign(this, options);
  }

  get isCss() {
    return this.mediaType === "text/css";
  }

  get isLess() {
    return this.mediaType === "text/less";
  }

  get isSass() {
    return ["text/x-scss", "text/x-sass"].includes(this.mediaType);
  }

  async text() {
    return text(this.contents);
  }

  toResponse() {
    return new Response(this.contents, {
      headers: { "Content-Type": this.mediaType },
    });
  }
}
