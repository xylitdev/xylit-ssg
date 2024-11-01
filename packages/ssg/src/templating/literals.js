import { TemplateResult } from "./template-result.js";

function extendsTemplateResult(fn) {
  Object.setPrototypeOf(fn.prototype, TemplateResult.prototype);
}

extendsTemplateResult(html);
export function html(strings, ...values) {
  if (!new.target) return TemplateResult(strings, values, html);
}
