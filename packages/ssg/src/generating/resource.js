import { text } from "node:stream/consumers";

export const isSass = ({ mediaType }) =>
  ["text/x-scss", "text/x-sass"].includes(mediaType);

export const isCss = ({ mediaType }) => mediaType == "text/css";

export const isLess = ({ mediaType }) => mediaType == "text/less";

export class Resource {
  constructor(options) {
    Object.assign(this, options);
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
