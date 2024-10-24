import mime from "mime";

import { transform } from "../runtime/style.js";

export class Pipeline {
  async process({ src }) {
    if (![".sass", ".scss", ".css"].some(ext => src.endsWith(ext))) {
      return;
    }

    const result = await transform(null, { src });

    return new Response(result.source, {
      headers: { "Content-Type": mime.getType("file.css") },
    });
  }
}
