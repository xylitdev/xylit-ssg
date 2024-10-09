# Xylit SSG

This package contains the core functionality of [Xylit SSG](../../).

## `.ssg.js`-Format

SSG files are JavaScript files that are slightly transformed before execution. This is necessary in order to perform a dynamic code analysis.

Consider this SSG file

```js
const css = style.module.css`
  .headline {
    color: red;
  }
`;

export default html`<h1 class=${css.headline}>Hello Xylit</h1>`;
```

Converted, it looks similar like this:

```js
import * as SSG from "@xylit/ssg";
const { html, style } = SSG.init(import.meta);
export const meta = import.meta;

const css = style.module.css`
  .headline {
    color: red;
  }
`;

export default SSG.defineComponent(import.meta, () =>
  html`<h1 class=${css.headline}>Hello Xylit</h1>`;
);
```
