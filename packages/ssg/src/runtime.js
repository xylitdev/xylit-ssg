import { createHash } from "node:crypto";

import { defineGetters } from "#lib/common/language.js";
import { createURL } from "#lib/common/url.js";

import { createComponent } from "#src/core/component.js";
import * as literals from "#src/core/literals.js";

const createLiteral =
  ({ ssgMeta, lang, type }) =>
  (strings, ...values) => {
    const meta = {};
    const ir = Object.assign(literals[lang](strings, ...values), {
      meta,
    });

    if (type === "scoped") {
      meta.scope = ssgMeta.scope;
    } else if (type?.startsWith?.("module")) {
      meta.cssModule = {
        scopeBehaviour: type.endsWith("global") ? "global" : "local",
        localsConvention: "camelCaseOnly",
      };
    }

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

  return {
    html: literals.html,
    style: createStyleApi(bundle => createStyleApi({ bundle })),

    createComponent(template) {
      return createComponent({
        scope: ssgMeta.scope,
        style: ssgMeta.styles,
        template,
      });
    },
  };
}
