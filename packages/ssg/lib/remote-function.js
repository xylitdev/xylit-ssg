import { randomUUID } from "node:crypto";

export function createCaller(port, ident = "") {
  const identifier = `RemoteFunctionCall:${ident}`;
  const pendings = new Map();

  port.on("message", msg => {
    const parsed = JSON.parse(msg);

    if (identifier !== parsed?.identifier) return;

    const pending = pendings.get(parsed.nonce);
    const { status, data } = parsed;

    if (pending) {
      pendings.delete(pending);
      pending[status](data);
    }
  });

  return {
    async call(name, ...args) {
      return new Promise((resolve, reject) => {
        const nonce = randomUUID();
        const msg = {
          name,
          nonce,
          identifier,
          data: args,
        };

        pendings.set(nonce, { resolve, reject });

        port.postMessage(JSON.stringify(msg));
      });
    },
  };
}

export function createReceiver(port, ident = "") {
  const identifier = `RemoteFunctionCall:${ident}`;
  const _actions = {};

  port.on("message", async msg => {
    const parsed = JSON.parse(msg);

    if (identifier !== parsed.identifier) return;

    const action = _actions[parsed.name];
    const answer = {
      name: parsed.name,
      nonce: parsed.nonce,
      identifier,
    };

    try {
      answer.data = await action(...parsed.data);
      answer.status = "resolve";
    } catch (error) {
      answer.data = error;
      answer.status = "reject";
    }

    port.postMessage(JSON.stringify(answer));
  });

  return {
    on(actions) {
      Object.assign(_actions, actions);
    },
  };
}
