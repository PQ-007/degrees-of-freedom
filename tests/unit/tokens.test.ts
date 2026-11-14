// Contrast of every token pair the pages use for text and focus, in both themes.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrast } from "../../src/lib/contrast";

const css = readFileSync(
  new URL("../../src/styles/tokens.css", import.meta.url),
  "utf8",
);

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`tokens.css has no "${selector}" block`);
  const body = css.slice(start, css.indexOf("}", start));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    if (m[1] && m[2]) out[m[1]] = m[2];
  }
  return out;
}

const light = block(":root");
const themes = {
  light,
  dark: { ...light, ...block(':root[data-theme="dark"]') },
};

// [foreground, background, minimum]: 4.5 for text (WCAG 1.4.3), 3 for the focus ring (1.4.11).
const pairs: [string, string, number][] = [
  ["ink", "bg", 4.5],
  ["ink", "surface", 4.5],
  ["muted", "bg", 4.5],
  ["muted", "surface", 4.5],
  ["head-fg", "head-bg", 4.5],
  ["primary-fg", "primary-bg", 4.5],
  ["error", "bg", 4.5],
  ["error", "surface", 4.5],
  ["ink", "bg", 3], // focus ring
  ["selected-fg", "selected-bg", 4.5],
];

describe.each(Object.entries(themes))("%s theme", (_name, tokens) => {
  it.each(pairs)("--%s on --%s ≥ %d:1", (fg, bg, min) => {
    const a = tokens[fg];
    const b = tokens[bg];
    expect(a, `--${fg} is missing`).toBeDefined();
    expect(b, `--${bg} is missing`).toBeDefined();
    const ratio = contrast(a as string, b as string);
    expect(
      ratio,
      `--${fg} ${a} on --${bg} ${b} is ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(min);
  });
});
