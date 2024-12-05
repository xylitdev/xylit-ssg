import {
  isArray,
  isFunction,
  isNullish,
  isThenable,
} from "#lib/common/type.js";

function* chunks(...hierarchy) {
  const stack = [];
  const { strings, values } = hierarchy.at(-1);

  for (const i in values) {
    stack.push(values[i], strings[i]);

    while (stack.length) {
      let chunk = stack.pop();

      if (chunk instanceof IntermediateRepresentation) {
        yield* chunks(...hierarchy, chunk);
      } else if (isArray(chunk)) {
        stack.push(...chunk.reverse());
      } else if (isFunction(chunk)) {
        stack.push(chunk(hierarchy, stack, i));
      } else {
        const item = yield { chunk, hierarchy };

        if (!isNullish(item)) stack.push(item);
      }
    }
  }

  yield { chunk: strings.at(-1), hierarchy };
}

export class IntermediateRepresentation {
  constructor(strings, values) {
    Object.assign(this, { strings, values });
  }

  async join(separator = "") {
    const chunks = [];

    for await (const { chunk } of this) {
      chunks.push(chunk);
    }

    return chunks.join(separator);
  }

  [Symbol.iterator]() {
    return chunks(this);
  }

  async *[Symbol.asyncIterator]() {
    const it = chunks(this);

    while (true) {
      const { value, done } = it.next(it.pushBack);
      delete it.pushBack;

      if (done) break;

      if (isThenable(value.chunk)) {
        it.pushBack = await value.chunk;
      } else {
        yield value;
      }
    }
  }
}
