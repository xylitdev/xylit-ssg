import { createHash } from "node:crypto";

import { createURL, defineGetters } from "#lib/common";

import { createComponent } from "./templating/component.js";
import * as literals from "./templating/literals.js";

const createLiteral =
  ({ ssgMeta, lang, type }) =>
  (strings, ...values) => {
    const ir = Object.assign(literals[lang](strings, ...values), {
      url: ssgMeta.url,
      mode: type === "scoped" ? `scoped/${ssgMeta.scope}` : type,
    });

    ssgMeta.styles.push(ir);

    return new Proxy(name => ir.exports?.[name], {
      get(target, prop) {
        return target(prop);
      },
    });
  };

export function initialize(meta) {
  const hash = createHash("shake256", { outputLength: 5 })
    .update(createURL(meta.url, { search: "" }).toString())
    .digest("hex");

  const ssgMeta = {
    ...meta,
    styles: [],
    scope: `data-${hash}`,
  };

  const createStyleApi = obj =>
    defineGetters(obj, {
      module: conf => createStyleApi({ ...conf, type: "module" }),
      scoped: conf => createStyleApi({ ...conf, type: "scoped" }),
      css: conf => createLiteral({ ...conf, ssgMeta, lang: "css" }),
      scss: conf => createLiteral({ ...conf, ssgMeta, lang: "scss" }),
    });

  let componentContext;

  return {
    html: literals.html,
    style: createStyleApi(bundle => createStyleApi({ bundle })),

    createComponent(template) {
      return createComponent({
        scope: ssgMeta.scope,
        styles: ssgMeta.styles,
        template,
        context: () => componentContext,
      });
    },

    setContext(context) {
      componentContext = context;
    },
  };
}
