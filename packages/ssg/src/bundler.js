export default class Bundler {
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
