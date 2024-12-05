import postcss from "postcss";
import PostcssModulesPlugin from "postcss-modules";

import PostcssScopedPlugin from "#lib/postcss-scoped-plugin.js";

export function createCssProcessor(options) {
  return {
    condition: r => r.mediaType === "text/css",
    async transform(resource) {
      const meta = {};
      const plugins = Array.from(options?.plugins ?? []);

      if (resource.meta.scope) {
        const plugin = PostcssScopedPlugin(resource.meta.scope);
        plugins.push(plugin);
      }

      if (resource.meta.cssModule) {
        const plugin = PostcssModulesPlugin({
          ...options,
          ...cssModule,
          getJSON: (filename, json) => (meta.exports = json),
        });

        plugins.push(plugin);
      }

      const css = await resource.text();
      const result = await postcss(plugins).process(css, {
        from: resource.path | "style.css",
        to: resource.path | "style.css",
      });

      return {
        meta,
        mediaType: "text/css",
        contents: [result.css],
      };
    },
  };
}
