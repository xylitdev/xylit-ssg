import { join } from "node:path";

const configPath = join(process.cwd(), "xylit.config.js");

const [{ default: conf }, { serve }] = await Promise.all([
  import(configPath).catch(() => ({})),
  import("./api.js"),
]);

serve(conf);
