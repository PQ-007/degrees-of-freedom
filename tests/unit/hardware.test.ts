import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import type { CompareTable } from "../../src/lib/compare";
import {
  checkHardware,
  sectionKeys,
  type HardwareCategory,
} from "../../src/lib/hardware";
import { languages } from "../../src/lib/i18n";

const root = new URL("../../content/", import.meta.url);
const read = <T>(path: string) =>
  parse(readFileSync(new URL(path, root), "utf8")) as T;
const nodeIds = new Set(
  read<{ id: string }[]>("tree/nodes.yaml").map((n) => n.id),
);
const tables = new Map(
  readdirSync(new URL("compare/", root))
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => read<CompareTable>(`compare/${f}`))
    .map((t) => [t.id, t]),
);
const t = { en: "x", mn: "х" };
const cat = (): HardwareCategory => ({
  id: "H9",
  slug: "demo",
  nodes: ["C4"],
  types: [
    { key: "a", node: "C4", name: t },
    { key: "b", node: "C9", name: t },
  ],
});
const page = (body: string) => languages.map((lang) => ({ lang, body }));
const good =
  "Intro.\n\n## A {#a}\n\n- **Good for:** x\n\nText.\n\n## B {#b}\n\n- **Good for:** y\n";

describe("checkHardware", () => {
  it("accepts a category whose page has a section per type, opening with facts", () => {
    expect(
      checkHardware(cat(), nodeIds, tables, languages, page(good)),
    ).toEqual([]);
  });

  it("finds the sections' keys in order", () => {
    expect(sectionKeys(good)).toEqual(["a", "b"]);
  });

  it("rejects missing or misordered sections, sections without facts, and a missing language", () => {
    const swapped = "## B {#b}\n\n- **x:** y\n\n## A {#a}\n\nNo facts.\n";
    expect(
      checkHardware(cat(), nodeIds, tables, languages, [
        { lang: "en", body: swapped },
      ]),
    ).toEqual([
      'hardware/en/demo.md: needs one "## Name {#key}" section per type, in order (a, b)',
      'hardware/en/demo.md: section {#a} must open with its facts list ("- **Good for:** …")',
      "hardware/demo.yaml has no mn text: add content/hardware/mn/demo.md",
    ]);
  });

  it("rejects a compare table whose rows aren't the category's types", () => {
    const c = cat();
    c.compare = "X1";
    expect(checkHardware(c, nodeIds, tables, languages, page(good))[0]).toMatch(
      /the types must match compare table X1's rows, in order/,
    );
    c.compare = "X99";
    expect(checkHardware(c, nodeIds, tables, languages, page(good))).toEqual([
      "hardware/demo.yaml folds in compare table X99, which doesn't exist",
    ]);
  });

  it("rejects bad IDs, keys, nodes and names", () => {
    const c = cat();
    c.id = "Q1";
    c.types = [{ key: "Bad Key", node: "Z9", name: { en: "x" } }];
    expect(
      checkHardware(c, nodeIds, tables, languages, page("## X {#bad-key}\n")),
    ).toEqual([
      "hardware/demo.yaml: the ID is H and a number",
      "hardware/demo.yaml: type 1 (Bad Key): a key is lowercase words joined by -",
      "hardware/demo.yaml: type 1 (Bad Key) links node Z9, which is not in nodes.yaml",
      "hardware/demo.yaml: type 1 (Bad Key) has no mn name",
      'hardware/en/demo.md: needs one "## Name {#key}" section per type, in order (Bad Key)',
      'hardware/mn/demo.md: needs one "## Name {#key}" section per type, in order (Bad Key)',
    ]);
  });
});

describe("Common models boxes", () => {
  it("need a different label each", () => {
    const box = '<aside class="examples" aria-label="Common models">';
    const body = good.replace("Text.", `${box}\n\n${box}`);
    expect(
      checkHardware(cat(), nodeIds, tables, ["en"], [{ lang: "en", body }]),
    ).toEqual([
      'hardware/en/demo.md: two boxes are labelled "Common models"; add the type\'s name to each label',
    ]);
  });
});

describe("the real Hardware categories", () => {
  for (const f of readdirSync(new URL("hardware/", root)).filter((f) =>
    f.endsWith(".yaml"),
  )) {
    it(`${f} passes every check`, () => {
      const c = read<HardwareCategory>(`hardware/${f}`);
      const pages = languages.map((lang) => ({
        lang,
        body: readFileSync(
          new URL(`hardware/${lang}/${c.slug}.md`, root),
          "utf8",
        ),
      }));
      expect(checkHardware(c, nodeIds, tables, languages, pages)).toEqual([]);
    });
  }
});
