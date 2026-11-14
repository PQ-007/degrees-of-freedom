import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import {
  checkGlossary,
  groupByTier,
  searchText,
  termLinks,
  type Term,
} from "../../src/lib/glossary";
import { languages } from "../../src/lib/i18n";

const root = fileURLToPath(new URL("../../content/", import.meta.url));
const tree = parse(readFileSync(join(root, "tree/nodes.yaml"), "utf8")) as {
  id: string;
  tier: number;
}[];
const nodeIds = new Set(tree.map((n) => n.id));
const tierOf = new Map(tree.map((n) => [n.id, n.tier]));
const term = (id: string, node: string, en: string, mn: string): Term => ({
  id,
  node,
  term: { en, mn },
  def: { en: "x", mn: "х" },
});
const both = (...ids: string[]) =>
  new Map(languages.map((l) => [l, new Set(ids)]));

describe("termLinks", () => {
  it("finds [[~id]] and [[~id|text]], not node links", () => {
    expect(termLinks("A [[~encoder]], [[~imu|an IMU]] and [[C4]].")).toEqual([
      "encoder",
      "imu",
    ]);
  });
});

describe("checkGlossary", () => {
  it("accepts terms that are linked in every language", () => {
    expect(
      checkGlossary([term("a", "F0", "A", "А")], nodeIds, languages, both("a")),
    ).toEqual([]);
  });

  it("rejects duplicates, bad IDs, unknown topics, missing text and bad see-also", () => {
    const bad = term("Bad_id", "Z9", "B", "");
    bad.see = ["Bad_id", "nope"];
    expect(
      checkGlossary(
        [term("a", "F0", "A", "А"), term("a", "F0", "A", "А"), bad],
        nodeIds,
        languages,
        both("a", "Bad_id"),
      ),
    ).toEqual([
      "glossary/terms.yaml: a is listed twice",
      "glossary/terms.yaml: Bad_id: an ID is lowercase words joined by -",
      "glossary/terms.yaml: Bad_id belongs to Z9, which is not in nodes.yaml",
      'glossary/terms.yaml: Bad_id has no mn "term"',
      'glossary/terms.yaml: Bad_id lists itself under "see"',
      'glossary/terms.yaml: Bad_id: "see" names nope, which is not a term',
    ]);
  });

  it("rejects a term no page links, and a link to no term", () => {
    expect(
      checkGlossary(
        [term("a", "F0", "A", "А")],
        nodeIds,
        languages,
        new Map([
          ["en", new Set(["a", "ghost"])],
          ["mn", new Set<string>()],
        ]),
      ),
    ).toEqual([
      "a en page links [[~ghost]], which is not in glossary/terms.yaml",
      "glossary/terms.yaml: a is never linked from a mn page; link it where the text uses it, with [[~a]]",
    ]);
  });
});

describe("groupByTier", () => {
  it("puts T0 first and sorts each tier in the page's language", () => {
    const terms = [
      term("torque", "F5", "Torque", "Эргүүлэх момент"),
      term("encoder", "C9", "Encoder", "Энкодер"),
      term("robot", "F0", "Robot", "Робот"),
      term("actuator", "C5", "Actuator", "Актуатор"),
    ];
    const en = groupByTier(terms, tierOf, "en");
    expect(en.map((g) => [g.tier, g.terms.map((t) => t.id)])).toEqual([
      [0, ["robot", "torque"]],
      [1, ["actuator", "encoder"]],
    ]);
    // Mongolian order: Ө after О and before П; Latin-script terms after Cyrillic.
    const mn = groupByTier(
      [
        term("sensor", "C9", "Sensor", "Мэдрэгч"),
        term("bus", "C12", "Bus", "Bus"),
        term("p", "C9", "P", "Пүрш"),
        term("o", "C9", "O", "Өнцөг"),
        term("encoder", "C9", "Encoder", "Энкодер"),
      ],
      tierOf,
      "mn",
    );
    expect(mn[0]?.terms.map((t) => t.id)).toEqual([
      "sensor",
      "o",
      "p",
      "encoder",
      "bus",
    ]);
  });
});

describe("searchText", () => {
  it("matches the term in every language and the definition in the page's", () => {
    const t = term("encoder", "C9", "Encoder", "Энкодер");
    expect(searchText(t, "mn")).toBe("encoder энкодер х");
  });
});

describe("the real glossary", () => {
  const terms = parse(
    readFileSync(join(root, "glossary/terms.yaml"), "utf8"),
  ) as Term[];

  it("passes every check, with every term linked in every language", () => {
    const linked = new Map<string, Set<string>>();
    for (const file of readdirSync(root, { recursive: true })) {
      const path = String(file);
      const lang = /(?:^|[/\\])(en|mn)(?:[/\\]|\.md$)/.exec(path)?.[1];
      if (!lang || !path.endsWith(".md")) continue;
      const set = linked.get(lang) ?? new Set<string>();
      for (const id of termLinks(readFileSync(join(root, path), "utf8")))
        set.add(id);
      linked.set(lang, set);
    }
    expect(checkGlossary(terms, nodeIds, languages, linked)).toEqual([]);
  });
});
