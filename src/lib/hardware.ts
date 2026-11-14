// The Hardware section as data: pure functions, no Astro, no DOM
// (tests/unit/hardware.test.ts).
//
// Chosen by the user, 2026-11-14: Hardware replaces the Compare tab, laid out
// like a streaming catalogue: one row of picture cards per category (motors,
// then microcontrollers, then sensors…), and a short page per type with its
// drawing, facts, a paragraph, common models and the category's compare table
// folded in as a side feature.
//
//   content/hardware/<slug>.yaml           the category: ID, topics, compare
//                                          table, types (key, topic)
//   content/hardware/<lang>/<slug>.md      title, summary, "Which one?" advice
//   content/hardware/<lang>/<slug>/<key>.md  a type: title, one-line summary,
//                                          figureAlt; opens with a facts list
//   content/figures/hw-<key>.svg           the type's drawing
import type { CompareTable } from "./compare";

export interface HardwareType {
  key: string;
  /** The topic that teaches how this kind of part works. */
  node: string;
}

export interface HardwareCategory {
  id: string;
  slug: string;
  nodes: string[];
  compare?: string | undefined;
  types: HardwareType[];
}

export interface TypePage {
  lang: string;
  key: string;
  body: string;
}

const KEY = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** The drawing's file name for a type. */
export const figureName = (key: string) => `hw-${key}`;

/** Whether a type's page opens with its facts list. */
export function opensWithFacts(body: string): boolean {
  const first = body.split("\n").find((line) => line.trim() !== "");
  return first?.startsWith("- **") ?? false;
}

/** Every problem with a category, as messages naming the file and the fix. */
export function checkHardware(
  cat: HardwareCategory,
  nodeIds: ReadonlySet<string>,
  tables: ReadonlyMap<string, CompareTable>,
  languages: readonly string[],
  categoryLangs: readonly string[],
  typePages: readonly TypePage[],
  figures: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  const at = `hardware/${cat.slug}.yaml`;
  if (!/^H\d+$/.test(cat.id)) errors.push(`${at}: the ID is H and a number`);
  for (const n of cat.nodes) {
    if (!nodeIds.has(n))
      errors.push(`${at} links node ${n}, which is not in nodes.yaml`);
  }
  const keys = cat.types.map((t) => t.key);
  cat.types.forEach((t, i) => {
    const where = `${at}: type ${i + 1} (${t.key})`;
    if (!KEY.test(t.key))
      errors.push(`${where}: a key is lowercase words joined by -`);
    if (keys.indexOf(t.key) !== i) errors.push(`${where} is listed twice`);
    if (!nodeIds.has(t.node))
      errors.push(`${where} links node ${t.node}, which is not in nodes.yaml`);
    if (!figures.has(figureName(t.key)))
      errors.push(
        `${where} has no drawing: add content/figures/${figureName(t.key)}.svg`,
      );
  });
  if (cat.compare) {
    const table = tables.get(cat.compare);
    if (!table) {
      errors.push(
        `${at} folds in compare table ${cat.compare}, which doesn't exist`,
      );
    } else {
      const rows = table.rows.map((r) => r.key);
      if (rows.join() !== keys.join())
        errors.push(
          `${at}: the types must match compare table ${cat.compare}'s rows, in order (types: ${keys.join(", ")}; rows: ${rows.join(", ")})`,
        );
    }
  }
  for (const lang of languages) {
    if (!categoryLangs.includes(lang))
      errors.push(
        `${at} has no ${lang} text: add content/hardware/${lang}/${cat.slug}.md`,
      );
    for (const key of keys) {
      const page = typePages.find((p) => p.lang === lang && p.key === key);
      const file = `hardware/${lang}/${cat.slug}/${key}.md`;
      if (!page)
        errors.push(`${at}: type ${key} has no ${lang} page: add ${file}`);
      else if (!opensWithFacts(page.body))
        errors.push(
          `${file} must open with its facts list ("- **Good for:** …")`,
        );
    }
  }
  for (const p of typePages) {
    if (!keys.includes(p.key))
      errors.push(
        `hardware/${p.lang}/${cat.slug}/${p.key}.md isn't a type in ${at}: add it there or remove the page`,
      );
  }
  return errors;
}
