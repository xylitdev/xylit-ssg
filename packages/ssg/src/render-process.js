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
  const [{ context: ctx, on, off }, { default: Component }] = await Promise.all(
    [import("./ssg.js"), import(componentPath)]
  );

  const styles = [];
  Object.assign(ctx, context);

  const onRender = ({ meta }) => {
    styles.push(...meta.styleDefinitions);
  };

  on("component:render", onRender);

  Component().then(async content => {
    off("component:render", onRender);

    process.send({
      content,
      styles: await Promise.all(styles),
    });
  });
});
