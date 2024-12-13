import { resolve } from "node:path";

const config = {};
const configFile = resolve(process.cwd(), "ssg.config.js");

const conf = await import(configFile)
  .then(module => Object.assign(config, module.default))
  .catch(() => ({}));

const cwd = process.cwd();

export default {
  cwd,
  input: resolve(cwd, conf.input ?? "site"),
  output: resolve(cwd, conf.output ?? "_site"),
  style: {
    cssModules: (cm => ({
      scopeBehaviour: cm?.scopeBehaviour ?? "local",
      localsConvention: cm?.localsConvention ?? "camelCaseOnly",
    }))(conf.style?.cssModules),
    sass: {
      loadPaths: [cwd, "node_modules", ...(conf.style?.sass?.loadPaths || [])],
    },
    plugins: [],
  },
  server: {
    port: conf.server?.port ?? 8080,
    host: conf.server?.host ?? "0.0.0.0",
    root: resolve(cwd, conf.server?.root ?? "public"),
  },
};
