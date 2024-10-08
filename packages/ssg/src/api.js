import { createServer } from "./dev-server/server.js";

export const serve = async conf => {
  const server = createServer();

  await server.listen();
};

export const build = async conf => {
  console.log("...build not implemented, yet");
  // Code idea:
  // const router = new Router(conf?.router);
  // const bundler = new StyleBundler(conf);
  // const pipeline = new AssetPipeline(conf?.dir?.out);

  // const generations = [];
  // const deferredTasks = [];

  // const generate = async ([route, src], { doc, styles }) => {
  //   const walker = new DocumentWalker(document);
  //   const injections = bundler.registerInjector(walker, ...styles);
  //   const replacements = [];
  //   walker.on("link[rel=stylesheet][href]", ({ attributes }) => {
  //     const replacement = pipeline
  //       .processFile(attributes.href)
  //       .on("hashed", ({ path }) => (attributes.href = path));
  //     replacements.push(replacement);
  //   });
  //   walker.on("img[src]", async ({ attributes }) => {
  //     const replacement = pipeline
  //       .processFile(attributes.src)
  //       .on("hashed", ({ path }) => (attributes.src = path));
  //     replacements.push(replacement);
  //   });
  //   walker.traverse();
  //   await Promise.all([...injections, ...replacements]);
  //   const src = join(conf.dir.routes, `${route}.html`);
  //   const html = render(document);
  //   return pipeline.process(html, { src });
  // };

  // await router.scan(conf?.dir?.pages);

  // for (const [route, path] of router.entries()) {
  //   const routingResult = await exec(path, {
  //     url: { pathname: route },
  //   });

  //   if (routingResult.styles.some(({ bundle }) => isGlobalBundle(bundle))) {
  //     deferredTasks.push([route, routingResult]);
  //   } else {
  //     generations.push(generate([route, path], routingResult));
  //   }
  // }

  // return Promise.all(generations);
};
