import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";

export const render = async templatePath => {
  let child;

  return new Promise((resolve, reject) => {
    const path = fileURLToPath(import.meta.url);

    child = fork(path, { silent: false, detached: true });
    child.send(templatePath);
    child.on("message", resolve);
    child.on("exit", reject);
  }).finally(() => {
    child?.kill?.();
  });
};

process.on("message", async ({ componentPath, context }) => {
  const [{ context: ctx }, { default: Component }] = await Promise.all([
    import("./xylit.js"),
    import(componentPath),
  ]);

  Object.assign(ctx, context);

  process.send(await Component());
});
