import { register } from "node:module";
import { pathToFileURL } from "node:url";
import { MessageChannel } from "node:worker_threads";

import { createCaller } from "#lib/remote-function.js";

const { port1, port2 } = new MessageChannel();

export const invalidateUrl = createCaller(port1, "invalidateUrl");

register("../src/loaders/dep-loader.js", {
  parentURL: import.meta.url,
  data: { port: port2 },
  transferList: [port2],
});

register("../src/loaders/ssg-loader.js", import.meta.url);

export async function invalidatePath(...paths) {
  const urls = paths.map(path => pathToFileURL(path).toString());

  return invalidateUrl(...urls);
}
