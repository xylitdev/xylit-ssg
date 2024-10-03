import render from "dom-serializer";
import { Parser, DomHandler } from "htmlparser2";

const ATTRIBUTE = 0;
const ATTRIBUTE_VALUE = 1;
const CHILD = 2;
const COMMENT = 3;
const PROCESSING_INSTRUCTION = 4;

const placeholderReg = /__xylit-\d+__/;
const placeholderRegG = /__xylit-\d+__/g;

class XylitHandler extends DomHandler {
  constructor({ tagId }) {
    super();

    this.gaps = [];
    this.tagId = tagId;
  }
  onparserinit(parser) {
    this.parser = parser;
  }
  onreset() {
    super.onreset();

    this.gaps = [];
  }

  onopentag(name, attribs) {
    const attrs = this.tagId
      ? { [`data-${this.tagId}`]: "", ...attribs }
      : attribs;

    super.onopentag(name, attrs);

    Object.entries(attribs).some(([name, value]) => {
      if (placeholderReg.test(name)) {
        this.gaps.push(ATTRIBUTE);
      } else {
        value.match(placeholderRegG)?.forEach?.(name => {
          this.gaps.push(ATTRIBUTE_VALUE);
        });
      }
    });
  }
  ontext(data) {
    super.ontext(data);

    if (placeholderReg.test(data)) {
      this.gaps.push(CHILD);
    }
  }
  oncomment(data) {
    super.oncomment(data);

    data.match(placeholderRegG)?.forEach?.(() => {
      this.gaps.push(COMMENT);
    });
  }

  onprocessinginstruction(name, data) {
    super.onprocessinginstruction(name, data);

    if (placeholderReg.test(data)) {
      this.gaps.push(PROCESSING_INSTRUCTION);
    }
  }
}

const parsed = new WeakMap();

export { ATTRIBUTE, ATTRIBUTE_VALUE, CHILD, COMMENT, PROCESSING_INSTRUCTION };

export const createParser = config => {
  const handler = new XylitHandler(config);
  const parser = new Parser(handler);

  return {
    parse(strings) {
      if (!parsed.has(strings)) {
        parser.reset();

        strings.forEach((str, idx) => {
          if (idx < strings.length - 1) {
            parser.write(`${str}${`__xylit-${idx}__`}`);
          } else {
            parser.write(str);
          }
        });

        parser.end();

        parsed.set(strings, [
          render(handler.dom).split(placeholderReg),
          handler.gaps,
        ]);
      }

      return parsed.get(strings);
    },
  };
};
