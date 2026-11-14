import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import type { CompareTable } from "../../src/lib/compare";
import {
  checkHardware,
  figureName,
  opensWithFacts,
  type HardwareCategory,
  type TypePage,
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
const figures = new Set(
  readdirSync(new URL("figures/", root)).map((f) => f.replace(/\.svg$/, "")),
);
const cat = (): HardwareCategory => ({
  id: "H9",
  slug: "demo",
  nodes: ["C4"],
  types: [
    { key: "stepper", node: "C4" },
    { key: "gearmotor", node: "C4" },
  ],
});
const facts = "- **Good for:** x\n\nText.\n";
const pages = (keys: string[], body = facts): TypePage[] =>
  languages.flatMap((lang) => keys.map((key) => ({ lang, key, body })));
const check = (
  c: HardwareCategory,
  p: TypePage[],
  langs: readonly string[] = languages,
) => checkHardware(c, nodeIds, tables, languages, langs, p, figures);

describe("checkHardware", () => {
  it("accepts a category with a page and a drawing for every type", () => {
    expect(check(cat(), pages(["stepper", "gearmotor"]))).toEqual([]);
  });

  it("a type's page opens with its facts", () => {
    expect(opensWithFacts("\n- **Good for:** x")).toBe(true);
    expect(opensWithFacts("Text first.\n\n- **Good for:** x")).toBe(false);
  });

  it("rejects missing pages, pages without facts, stray pages and a missing category page", () => {
    const p = pages(["stepper"]).concat([
      { lang: "en", key: "gearmotor", body: "No facts." },
      { lang: "en", key: "warp", body: facts },
    ]);
    expect(check(cat(), p, ["en"])).toEqual([
      'hardware/en/demo/gearmotor.md must open with its facts list ("- **Good for:** …")',
      "hardware/demo.yaml has no mn text: add content/hardware/mn/demo.md",
      "hardware/demo.yaml: type gearmotor has no mn page: add hardware/mn/demo/gearmotor.md",
      "hardware/en/demo/warp.md isn't a type in hardware/demo.yaml: add it there or remove the page",
    ]);
  });

  it("rejects a type without a drawing, bad keys and nodes", () => {
    const c = cat();
    c.id = "Q1";
    c.types = [{ key: "Bad Key", node: "Z9" }];
    expect(check(c, pages(["Bad Key"]))).toEqual([
      "hardware/demo.yaml: the ID is H and a number",
      "hardware/demo.yaml: type 1 (Bad Key): a key is lowercase words joined by -",
      "hardware/demo.yaml: type 1 (Bad Key) links node Z9, which is not in nodes.yaml",
      `hardware/demo.yaml: type 1 (Bad Key) has no drawing: add content/figures/${figureName("Bad Key")}.svg`,
    ]);
  });

  it("rejects a compare table whose rows aren't the category's types", () => {
    const c = cat();
    c.compare = "X1";
    expect(check(c, pages(["stepper", "gearmotor"]))[0]).toMatch(
      /the types must match compare table X1's rows, in order/,
    );
    c.compare = "X99";
    expect(check(c, pages(["stepper", "gearmotor"]))).toEqual([
      "hardware/demo.yaml folds in compare table X99, which doesn't exist",
    ]);
  });
});

describe("the real Hardware categories", () => {
  for (const f of readdirSync(new URL("hardware/", root)).filter((f) =>
    f.endsWith(".yaml"),
  )) {
    it(`${f} passes every check`, () => {
      const c = read<HardwareCategory>(`hardware/${f}`);
      const typePages: TypePage[] = [];
      const catLangs: string[] = [];
      for (const lang of languages) {
        const dir = readdirSync(new URL(`hardware/${lang}/`, root));
        if (dir.includes(`${c.slug}.md`)) catLangs.push(lang);
        for (const file of readdirSync(
          new URL(`hardware/${lang}/${c.slug}/`, root),
        ))
          typePages.push({
            lang,
            key: file.replace(/\.md$/, ""),
            body: readFileSync(
              new URL(`hardware/${lang}/${c.slug}/${file}`, root),
              "utf8",
            )
              .split("---")
              .slice(2)
              .join("---"),
          });
      }
      expect(check(c, typePages, catLangs)).toEqual([]);
    });
  }
});
