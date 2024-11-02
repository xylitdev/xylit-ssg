import { DomHandler, Parser } from "htmlparser2";

import { findMapLast, isBoolean, isNullish, transform } from "#lib/common";
import { memoize } from "#lib/function";
import * as State from "#lib/htmlparser2/tokenizer-states";
import { stringifyAttribues, stringifyClasses } from "#lib/stringify";

import { processStyle } from "../processing/style.js";

import { generateStyle } from "./style.js";

class UnsupportedInterpolationError extends Error {
  static states = transform({ ...State }, (states, name, nr) => {
    states[nr] = name;
  });

  constructor({ state }, options) {
    super(UnsupportedInterpolationError.states[state], options);
  }
}

class ScopedHandler extends DomHandler {
  onopentag(name, attribs) {
    const attrs = this.scope ? { [this.scope]: "", ...attribs } : attribs;

    super.onopentag(name, attrs);
  }
}

const processStyleIR = memoize(async ir => {
  const resource = await generateStyle(ir);
  const result = await processStyle(resource, { mode: ir.mode });
  ir.exports = result.exports;

  return result;
});

export async function generate(result) {
  const handler = new ScopedHandler();
  const parser = new Parser(handler);
  const styles = new Set();

  for await (const { chunk, hierarchy } of result) {
    const styleIRs = hierarchy.at(-1).styles || [];

    for (const style of styleIRs) {
      styles.add(await processStyleIR(style));
    }

    if (isBoolean(chunk) || isNullish(chunk)) continue;

    handler.scope = findMapLast(hierarchy, ({ scope }) => scope);

    switch (parser.tokenizer.state) {
      case State.BeforeAttributeName:
        parser.write(stringifyAttribues(chunk));

        break;
      case State.BeforeAttributeValue:
        parser.write(`"${stringifyClasses(chunk)}"`);

        break;
      case State.InAttributeValueDq:
      case State.InAttributeValueSq:
        parser.write(`${stringifyClasses(chunk)}`);

        break;

      case State.Text:
      case State.InSpecialTag:
        parser.write(String(chunk));

        break;
      default:
        throw new UnsupportedInterpolationError(parser.tokenizer);
    }
  }

  parser.end();

  return {
    dom: handler.dom,
    styles: await Promise.all([...styles]),
  };
}
