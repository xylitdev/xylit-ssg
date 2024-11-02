import { IntermediateRepresentation } from "./intermediate-representation.js";

function extendsIR(fn) {
  Object.setPrototypeOf(fn.prototype, IntermediateRepresentation.prototype);
}

function constructIR(newTarget, ...args) {
  return Reflect.construct(IntermediateRepresentation, args, newTarget);
}

extendsIR(html);
export function html(strings, ...values) {
  return constructIR(html, strings, values);
}

extendsIR(css);
export function css(strings, ...values) {
  // potential fix for: https://github.com/lit/lit-element/issues/637?
  return constructIR(css, strings.raw ?? strings, values);
}

extendsIR(less);
export function less(strings, ...values) {
  return constructIR(less, strings.raw ?? strings, values);
}

extendsIR(sass);
export function sass(strings, ...values) {
  return constructIR(sass, strings.raw ?? strings, values);
}

extendsIR(scss);
export function scss(strings, ...values) {
  return constructIR(scss, strings.raw ?? strings, values);
}
