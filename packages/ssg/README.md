<div align="center">

![Xylit SSG](https://ssg.xylit.dev/xylit.svg "Xylit SSG")

[Xylit SSG](https://ssg.xylit.dev) is a powerful static site generator:  
Being Less Bloated... Being More Straightforward!

</div>

## Getting Started

Please follow the [official documentation](https://ssg.xylit.dev/getting-started/installation-and-setup/).

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
