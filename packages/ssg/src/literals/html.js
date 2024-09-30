import {
  isArray,
  isBoolean,
  isFunction,
  isNullish,
  isObject,
} from "../utils/common.js";

import { classes } from "../utils/shame.js";

import {
  createParser,
  ATTRIBUTE,
  ATTRIBUTE_VALUE,
  CHILD,
  COMMENT,
  PROCESSING_INSTRUCTION,
} from "./html.parser.js";

const transform = async (value, type) => {
  if (isNullish(value) || isBoolean(value)) {
    value = "";
  }

  switch (type) {
    case ATTRIBUTE:
      if (isObject(value)) {
        const attrs = [];

        for (const [name, val] of Object.entries(value)) {
          const transformed = await transform(val);
          attrs.push(transformed ? `${name}="${transformed}"` : name);
        }

        return attrs.join(" ");
      }

      break;
    case ATTRIBUTE_VALUE:
      if (isObject(value)) {
        return classes(value);
      }

      break;
    case CHILD:
      if (isFunction(value)) {
        return await value();
      }

      break;
    case COMMENT:
      return value;
    case PROCESSING_INSTRUCTION:
      return "";
  }

  return value;
};

const transformValues = async (substitutions, gaps) => {
  const values = [];

  let idx = 0;
  for await (let value of substitutions) {
    value = await transform(value, gaps[idx]);

    if (isArray(value)) {
      const arrValues = [];

      for await (const arrValue of value) {
        arrValues.push(await transform(arrValue, gaps[idx]));
      }

      value = arrValues.join("");
    }

    values.push(value);
    ++idx;
  }

  return values;
};

export const createHtmlLiteral = meta => {
  const { parse } = createParser({
    tagId: meta.urlHash,
  });

  return async (strings, ...substitutions) => {
    const [raw, parts] = parse(strings);

    const values = await transformValues(substitutions, parts);

    return String.raw({ raw }, ...values);
  };
};
