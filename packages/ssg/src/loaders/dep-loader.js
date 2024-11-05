import { DepGraph } from "dependency-graph";

import { createURL } from "#lib/common/url.js";
import { createReceiver } from "#lib/remote-function.js";

const graph = new DepGraph({ circular: true });
const versions = {};
let runtimeURL;

export async function initialize({ port, runtime }) {
  runtimeURL = runtime;
  const { on } = createReceiver(port);

  on({
    async invalidate(...urls) {
      const versionsToBump = new Set();

      urls
        .map(url => createURL(url, { search: "" }).toString())
        .forEach(url => {
          versionsToBump.add(url);
          graph.dependantsOf(url).forEach(depUrl => versionsToBump.add(depUrl));
        });

      for (const url of versionsToBump) {
        let version = versions[url] ?? 0;
        versions[url] = version + 1;
      }
    },
  });
}

export async function resolve(specifier, context, nextResolve) {
  const result = await nextResolve(specifier, context);

  if (result.url !== runtimeURL) {
    const node = createURL(result.url, { search: "" }).toString();
    graph.addNode(node);

    if (context.parentURL && context.parentURL !== runtimeURL) {
      const parent = createURL(context.parentURL, { search: "" }).toString();

      graph.addNode(parent);
      graph.addDependency(parent, node);
    }
  }

  if (versions[result.url]) {
    const url = new URL(result.url);
    url.searchParams.set("version", versions[result.url]);

    return {
      ...result,
      url: url.toString(),
    };
  }

  return result;
}
