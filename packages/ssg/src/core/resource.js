import { createReadStream } from "node:fs";
import { arrayBuffer, blob, json, text } from "node:stream/consumers";
import { pathToFileURL } from "node:url";

import mime from "mime";

export class Resource {
  static fromFile(path, encoding) {
    return new Resource({
      virtual: false,
      url: pathToFileURL(path).toString(),
      async *contents() {
        for await (const chunk of createReadStream(path, { encoding })) {
          yield chunk;
        }
      },
    });
  }

  constructor({ contents, mediaType, meta, url, virtual }) {
    this.url = url;
    this.contents = contents;
    this.mediaType = mediaType ?? mime.getType(url);
    this.virtual = (!url || virtual) ?? true;
    this.meta = { ...meta };

    Object.freeze(this);
  }

  async *[Symbol.asyncIterator]() {
    let contents = await (typeof this.contents === "function"
      ? this.contents()
      : this.contents);

    if (contents == null) return;

    if (typeof contents === "string") {
      contents = [contents];
    } else if (contents[Symbol.iterator] || contents[Symbol.asyncIterator]) {
      contents = contents;
    } else if (typeof contents.next === "function") {
      contents = { [Symbol.asyncIterator]: () => contents };
    } else {
      contents = [contents];
    }

    for await (const chunk of contents) {
      yield chunk;
    }
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

  async arrayBuffer() {
    return arrayBuffer(this);
  }

  async blob() {
    return blob(this);
  }

  async import() {
    if (this.virtual) {
      return import(`data:text/javascript, ${await this.text()}`);
    } else {
      return import(this.url);
    }
  }

  async json() {
    return json(this);
  }

  async text() {
    return text(this);
  }

  toResponse(init) {
    return new Response(this, {
      ...init,
      headers: {
        "Content-Type": this.mediaType,
        ...init?.headers,
      },
    });
  }
}
