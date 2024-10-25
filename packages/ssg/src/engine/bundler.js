export class StyleInjector {
  constructor(styles) {
    this.styles = styles;
  }

  element(element) {
    for (const style of this.styles) {
      element.append(`<style>${style.source}</style>`, { html: true });
    }
  }
}

export class Bundler {
  injectStyle(doc, ...styles) {
    const node =
      doc.querySelector("head") ||
      doc.querySelector("body") ||
      doc.querySelector("html") ||
      doc;

    node.insertAdjacentHTML?.(
      "beforeend",
      `<style>${styles.map(s => s.source).join("\n")}</style>`
    );
  }
}
