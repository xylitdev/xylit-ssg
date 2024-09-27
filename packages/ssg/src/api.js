import { createServer } from "./dev-server/server.js";
import { pick } from "./utils/common.js";

export const serve = async conf => {
  const server = createServer({
    ...pick(conf, "pages", "static"),
  });

  await server.listen();
};
