import { join } from "node:path";
import { program } from "commander";

const configPath = join(process.cwd(), "xylit.config.js");

const [{ default: conf }, api] = await Promise.all([
  import(configPath).catch(() => ({})),
  import("./api.js"),
]);

program
  .name("ssg")
  .description("CLI to generate static websites with xylit-ssg")
  .version("0.0.1")
  .option("--serve", "run the dev server")
  .option("--build", "generate the website")
  .action(async ({ serve, build }) => {
    if (serve) {
      await api.serve(conf);
    } else if (build) {
      await api.build(conf);
      process.exit();
    }
  })
  .parse();
