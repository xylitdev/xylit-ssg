import { randomUUID } from "node:crypto";

export function createCaller(port, name) {
  return (...args) =>
    new Promise((resolve, reject) => {
      const nonce = randomUUID();
      const req = JSON.stringify({ name, nonce, args });

      const onMessage = res => {
        const msg = JSON.parse(res);

        if (msg.nonce !== nonce) return;

        port.off("message", onMessage);

        if (msg.ok) {
          resolve(msg.result);
        } else {
          reject(msg.result);
        }
      };

      port.on("message", onMessage);
      port.postMessage(req);
    });
}

export function createReceiver(port, actions) {
  const onMessage = async req => {
    const { name, args, nonce } = JSON.parse(req);
    const res = { name, nonce };

    try {
      res.ok = true;
      res.result = await actions[name](...args);
    } catch (error) {
      res.ok = false;
      res.result = error;
    }

    port.postMessage(JSON.stringify(res));
  };

  port.on("message", onMessage);

  return () => {
    port.off("message", onMessage);
  };
}
