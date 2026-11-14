import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { checkCompare, dots, type CompareTable } from "../../src/lib/compare";
import { languages } from "../../src/lib/i18n";

const root = new URL("../../content/", import.meta.url);
const nodeIds = new Set(
  (
    parse(readFileSync(new URL("tree/nodes.yaml", root), "utf8")) as {
      id: string;
    }[]
  ).map((n) => n.id),
);

const table = (): CompareTable => ({
  id: "X9",
  slug: "demo",
  nodes: ["C4"],
  columns: [
    { key: "how", type: "text", label: { en: "How", mn: "Хэрхэн" } },
    { key: "speed", type: "rating", label: { en: "Speed", mn: "Хурд" } },
  ],
  rows: [
    {
      key: "a",
      name: { en: "A", mn: "А" },
      values: { how: { en: "x", mn: "х" }, speed: 3 },
    },
  ],
});
const check = (t: CompareTable) =>
  checkCompare(t, nodeIds, languages, languages);

describe("checkCompare", () => {
  it("accepts a complete table", () => {
    expect(check(table())).toEqual([]);
  });

  it("names a missing cell, a bad rating and a missing translation", () => {
    const t = table();
    t.rows[0] = { key: "a", name: { en: "A" }, values: { speed: 7 } };
    expect(check(t)).toEqual([
      'compare/demo.yaml: row "a" has no mn name',
      'compare/demo.yaml: row "a", column "how" is missing',
      'compare/demo.yaml: row "a", column "speed" must be a rating from 1 to 5',
    ]);
  });

  it("rejects unknown nodes and columns, and a missing language page", () => {
    const t = table();
    t.nodes = ["Z1"];
    const row = t.rows[0];
    if (row) row.values["size"] = 2;
    expect(checkCompare(t, nodeIds, languages, ["en"])).toEqual([
      "compare/demo.yaml has no mn text: add content/compare/mn/demo.md",
      "compare/demo.yaml links node Z1, which is not in nodes.yaml",
      'compare/demo.yaml: row "a" has a value for unknown column "size"',
    ]);
  });

  it("draws ratings as five dots", () => {
    expect(dots(1)).toBe("●○○○○");
    expect(dots(5)).toBe("●●●●●");
  });
});

describe("the real compare pages", () => {
  for (const f of readdirSync(root.pathname + "compare").filter((f) =>
    f.endsWith(".yaml"),
  )) {
    it(`${f} passes every check`, () => {
      const t = parse(
        readFileSync(new URL(`compare/${f}`, root), "utf8"),
      ) as CompareTable;
      const pageLangs = languages.filter((l) =>
        readdirSync(new URL(`compare/${l}/`, root)).includes(`${t.slug}.md`),
      );
      expect(checkCompare(t, nodeIds, languages, pageLangs)).toEqual([]);
    });
  }
});
