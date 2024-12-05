import { createReadStream } from "node:fs";
import { arrayBuffer, blob, json, text } from "node:stream/consumers";

import mime from "mime";

export class Resource {
  static fromFile(path, encoding) {
    return new Resource({
      virtual: false,
      path,
      async *contents() {
        for await (const chunk of createReadStream(path, { encoding })) {
          yield chunk;
        }
      },
    });
  }

  constructor({ contents, mediaType, meta, path, virtual }) {
    this.path = path;
    this.contents = contents;
    this.mediaType = mediaType ?? mime.getType(path);
    this.virtual = (!path || virtual) ?? true;
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

  async arrayBuffer() {
    return arrayBuffer(this);
  }

  async blob() {
    return blob(this);
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
