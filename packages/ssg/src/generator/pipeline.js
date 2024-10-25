import { Readable } from "node:stream";

import mime from "mime";

import { transform } from "../runtime/style.js";

export class Pipeline {
  async process({ src }) {
    if (![".sass", ".scss", ".css"].some(ext => src.endsWith(ext))) {
      return;
    }

    const result = await transform(null, { src });

    return {
      contents: Readable.from(result.source),
      mediaType: mime.getType("file.css"),
    };
  }
}
