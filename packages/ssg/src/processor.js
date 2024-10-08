import { parse } from "node-html-parser";
import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";

export let configPath;

export const setConfigPath = path => {
  configPath = path;
};
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
    childProcess.send({ path, context, configPath });
  });
};

process.on("message", async ({ path, context, configPath }) => {
  const [ssg, config] = await Promise.all([
    import("./ssg.js"),
    import(configPath).catch(() => ({ default: {} })),
  ]);

  ssg.setConfig(config.default);

  const { default: Component } = await import(path);

  const styles = [];
  Object.assign(ssg.context, context);

  const onRender = ({ meta }) => {
    styles.push(...meta.styleDefinitions);
  };

  ssg.on("component:render", onRender);

  Component().then(async content => {
    ssg.off("component:render", onRender);

    process.send({
      content,
      styles: await Promise.all(styles),
    });
  });
});
