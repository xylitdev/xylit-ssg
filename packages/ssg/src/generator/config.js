import { resolve } from 'node:path';

const config = {}
const configFile = resolve(process.cwd(), "ssg.config.js");

await import(configFile)
  .then(module => Object.assign(config, module.default))
  .catch(() => {})

export default config;