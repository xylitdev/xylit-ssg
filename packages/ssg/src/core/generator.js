import { memoize } from "#lib/common/function.js";
import { findMapLast } from "#lib/common/iterable.js";
import { isBoolean, isNullish } from "#lib/common/type.js";
import { ScopedDomHandler, AnyChunkParser } from "#lib/htmlparser2.js";

import { __Context } from "#src/template/component.js";
import { less, scss, sass } from "#src/template/literals.js";

import { Resource } from "./resource.js";
import { Document } from "./document.js";

export class Generator {
  constructor(processor) {
    this.processor = processor;
    this.generateDocument = memoize(this.generateDocument);
    this.generateStyle = memoize(this.generateStyle);
  }

  async generateStyle(ir) {
    let mediaType = "text/css";

    if (ir instanceof less) mediaType = "text/less";
    if (ir instanceof sass) mediaType = "text/x-sass";
    if (ir instanceof scss) mediaType = "text/x-scss";

    const resource = new Resource({
      contents: await ir.join(),
      url: ir.url,
      mediaType,
    });

    return resource;
  }

  async generateDocument(ir) {
    const handler = new ScopedDomHandler();
    const parser = new AnyChunkParser(handler);
    const assets = new Set();

    for await (const { chunk, hierarchy } of ir) {
      const styleIRs = hierarchy.at(-1).styles || [];

      for (const styleIR of styleIRs) {
        const resource = await this.generateStyle(styleIR).then(r =>
          this.processor.transform(r, { mode: styleIR.mode })
        );

        assets.add(resource);
      }

      if (isBoolean(chunk) || isNullish(chunk)) continue;

      handler.scope = findMapLast(hierarchy, ({ scope }) => scope);
      parser.write(chunk);
    }

    parser.end();
    const result = { document: new Document(handler.dom), assets: [...assets] };

    return result;
  }
}

Generator.prototype.generateDocument;
