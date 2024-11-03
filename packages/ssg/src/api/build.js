import { cp } from "node:fs/promises";

import config from "../config.js";

export async function build() {
  await cp(config.input, config.output, { recursive: true }).catch(() => {
    console.warn("static folder doesnt exist");
  });
}
