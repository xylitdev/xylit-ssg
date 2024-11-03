import { Parser, DomHandler } from "htmlparser2";

import { transform } from "./common/collection.js";
import { stringifyAttribues, stringifyClasses } from "./stringify.js";

const State = Object.freeze({
  Text: 1,
  BeforeTagName: 2, // After <
  InTagName: 3,
  InSelfClosingTag: 4,
  BeforeClosingTagName: 5,
  InClosingTagName: 6,
  AfterClosingTagName: 7,

  // Attributes
  BeforeAttributeName: 8,
  InAttributeName: 9,
  AfterAttributeName: 10,
  BeforeAttributeValue: 11,
  InAttributeValueDq: 12, // "
  InAttributeValueSq: 13, // '
  InAttributeValueNq: 14,

  // Declarations
  BeforeDeclaration: 15, // !
  InDeclaration: 16,

  // Processing instructions
  InProcessingInstruction: 17, // ?

  // Comments & CDATA
  BeforeComment: 18,
  CDATASequence: 19,
  InSpecialComment: 20,
  InCommentLike: 21,

  // Special tags
  BeforeSpecialS: 22, // Decide if we deal with `<script` or `<style`
  BeforeSpecialT: 23, // Decide if we deal with `<title` or `<textarea`
  SpecialStartSequence: 24,
  InSpecialTag: 25,
  InEntity: 26,
});

class UnsupportedInterpolationError extends Error {
  static states = transform({ ...State }, (states, name, nr) => {
    states[nr] = name;
  });

  constructor({ state }, options) {
    super(UnsupportedInterpolationError.states[state], options);
  }
}

export class ScopedDomHandler extends DomHandler {
  onopentag(name, attribs) {
    const attrs = this.scope ? { [this.scope]: "", ...attribs } : attribs;

    super.onopentag(name, attrs);
  }
}

export class AnyChunkParser extends Parser {
  write(chunk) {
    switch (this.tokenizer.state) {
      case State.BeforeAttributeName:
        super.write(stringifyAttribues(chunk));

        break;
      case State.BeforeAttributeValue:
        super.write(`"${stringifyClasses(chunk)}"`);

        break;
      case State.InAttributeValueDq:
      case State.InAttributeValueSq:
        super.write(`${stringifyClasses(chunk)}`);

        break;

      case State.Text:
      case State.InSpecialTag:
        super.write(String(chunk));

        break;
      default:
        throw new UnsupportedInterpolationError(parser.tokenizer);
    }
  }
}
