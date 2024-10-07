import { parse } from "node-html-parser";
import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";

let childProcess;

const createChildProcess = () => {
  const path = fileURLToPath(import.meta.url);
  childProcess = fork(path, { silent: false, detached: true });
};

export const kill = () => {
  childProcess?.kill?.();
  childProcess = undefined;
};

export const exec = async (path, context) => {
  if (!childProcess) {
    createChildProcess();
  }

  return new Promise((resolve, reject) => {
    childProcess.on("message", ({ content, styles }) => {
      resolve({
        doc: parse(content),
        styles,
      });
    });

    childProcess.on("exit", reject);
    childProcess.send({ path, context });
  });
};

process.on("message", async ({ path, context }) => {
  const [{ context: ctx, on, off }, { default: Component }] = await Promise.all(
    [import("./ssg.js"), import(path)]
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
