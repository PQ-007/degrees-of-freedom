// Small helpers every demo element shares: building elements and SVG, the
// page's language, labelled sliders and number formatting.
import { isLang, t, type Lang } from "../lib/i18n";
import type { MessageKey } from "../i18n/en";

export const SVG_NS = "http://www.w3.org/2000/svg";

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...children);
  return node;
}

export function svg(tag: string, attrs: Record<string, string | number> = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

/** The language of the page around `host` (falls back to English). */
export function pageLang(host: Element): Lang {
  const lang = host.closest("[lang]")?.getAttribute("lang");
  return isLang(lang) ? lang : "en";
}

export function translator(lang: Lang) {
  return (key: MessageKey) => t(lang, key);
}

let ids = 0;
export const uid = (prefix: string) => `${prefix}-${++ids}`;

/** A number in the page's language, with `digits` decimals. */
export function num(lang: Lang, value: number, digits: number): string {
  // −0.00 reads as a bug; show 0.00.
  const v = Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value;
  return v.toLocaleString(lang, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export interface Slider {
  row: HTMLElement;
  input: HTMLInputElement;
  value(): number;
  set(v: number): void;
}

/** A labelled range input with its value shown beside it. */
/** The site's loading animation (a turning wireframe cube, look.css):
 * decorative, so put words beside it. */
export function loader(): HTMLElement {
  return el(
    "span",
    { class: "loader", "aria-hidden": "true" },
    el("span", { class: "cube" }, ...Array.from({ length: 6 }, () => el("i"))),
  );
}

export function slider(opts: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format: (v: number) => string;
  onInput: (v: number) => void;
}): Slider {
  const id = uid("slider");
  const input = el("input", {
    id,
    type: "range",
    min: String(opts.min),
    max: String(opts.max),
    step: String(opts.step),
    value: String(opts.value),
  });
  const output = el("output", { for: id }, opts.format(opts.value));
  const sync = () => {
    output.value = opts.format(Number(input.value));
    input.setAttribute("aria-valuetext", output.value);
  };
  input.addEventListener("input", () => {
    sync();
    opts.onInput(Number(input.value));
  });
  sync();
  return {
    row: el(
      "div",
      { class: "demo-slider" },
      el("label", { for: id }, opts.label),
      input,
      output,
    ),
    input,
    value: () => Number(input.value),
    set(v) {
      input.value = String(v);
      sync();
    },
  };
}
