import { Parser } from "htmlparser2";
import { DomHandler } from "htmlparser2";

import { findMapLast, isBoolean, isNullish, transform } from "#lib/common";
import * as State from "#lib/htmlparser2/tokenizer-states";
import { stringifyAttribues, stringifyClasses } from "#lib/stringify";

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
    const attrs = this.scope
      ? { [`data-${this.scope}`]: "", ...attribs }
      : attribs;

    super.onopentag(name, attrs);
  }
}

export async function generate(result) {
  const handler = new ScopedHandler();
  const parser = new Parser(handler);
  const styles = new Set();

  for await (const { chunk, hierarchy } of result) {
    const currResult = hierarchy.at(-1);
    currResult.styles?.forEach?.(style => styles.add(style));

    if (isBoolean(chunk) || isNullish(chunk)) continue;

    handler.scope = findMapLast(hierarchy, ({ id }) => id);

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
