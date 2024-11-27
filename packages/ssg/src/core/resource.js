import mime from "mime";
import { createReadStream } from "node:fs";
import { arrayBuffer, blob, json, text } from "node:stream/consumers";

export class Resource {
  static fromFile(path, encoding) {
    return new Resource({
      path,
      isVirtual: false,
      async *contents() {
        for await (const chunk of createReadStream(path, { encoding })) {
          yield chunk;
        }
      },
    });
  }

  constructor({ contents, isVirtual, mediaType, path, ...other }) {
    this.isVirtual = (!path || !!isVirtual) ?? true;
    this.mediaType = mediaType ?? mime.getType(path);
    this.path = path;

    if (typeof contents === "string") {
      this.contents = [contents];
    } else if (contents[Symbol.iterator] || contents[Symbol.asyncIterator]) {
      this.contents = contents;
    } else if (typeof contents === "function") {
      this.contents = { [Symbol.asyncIterator]: contents };
    }

    Object.assign(this, other);
    Object.freeze(this);
  }

  async *[Symbol.asyncIterator]() {
    for await (const chunk of this.contents) {
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
    if (this.isVirtual) {
      return import(`data:text/javascript, ${await this.text()}`);
    } else if (this.path) {
      return import(this.path);
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
