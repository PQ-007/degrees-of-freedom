// The Hardware section as data: pure functions, no Astro, no DOM
// (tests/unit/hardware.test.ts).
//
// Chosen by the user, 2026-11-14: Hardware replaces the Compare tab. Each
// category (content/hardware/<slug>.yaml) lists its types; its page
// (content/hardware/<lang>/<slug>.md) has an intro, then one section per type,
// `## Name {#key}`, which starts with a short facts list (good for, not for,
// typical, topic). A category may fold a compare table in at the end, as a
// side feature: its rows must be the category's types, in the same order.
import type { CompareTable, Localized } from "./compare";

export interface HardwareType {
  key: string;
  /** The topic that teaches how this kind of part works. */
  node: string;
  name: Localized;
}

export interface HardwareCategory {
  id: string;
  slug: string;
  nodes: string[];
  compare?: string | undefined;
  types: HardwareType[];
}

const KEY = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** The `{#key}` anchors of the `## …` headings in a Markdown body, in order. */
export function sectionKeys(body: string): string[] {
  return [...body.matchAll(/^## .*\{#([a-z0-9-]+)\}\s*$/gm)].map(
    (m) => m[1] ?? "",
  );
}

/** Whether the type's section opens with a list (its facts). */
function opensWithList(body: string, key: string): boolean {
  const at = body.search(new RegExp(`^## .*\\{#${key}\\}\\s*$`, "m"));
  if (at < 0) return false;
  const after = body.slice(at).split("\n").slice(1);
  const first = after.find((line) => line.trim() !== "");
  return first?.startsWith("- **") ?? false;
}

/** Every problem with a category, as messages naming the file and the fix. */
export function checkHardware(
  cat: HardwareCategory,
  nodeIds: ReadonlySet<string>,
  tables: ReadonlyMap<string, CompareTable>,
  languages: readonly string[],
  pages: readonly { lang: string; body: string }[],
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
    for (const l of languages) {
      if (!t.name[l]?.trim()) errors.push(`${where} has no ${l} name`);
    }
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
    const page = pages.find((p) => p.lang === lang);
    if (!page) {
      errors.push(
        `${at} has no ${lang} text: add content/hardware/${lang}/${cat.slug}.md`,
      );
      continue;
    }
    const found = sectionKeys(page.body).filter((k) => keys.includes(k));
    if (found.join() !== keys.join())
      errors.push(
        `hardware/${lang}/${cat.slug}.md: needs one "## Name {#key}" section per type, in order (${keys.join(", ")})`,
      );
    // Each box is a landmark, so screen readers need a different name for each.
    const labels = [
      ...page.body.matchAll(/<aside[^>]*aria-label="([^"]*)"/g),
    ].map((m) => m[1] ?? "");
    for (const l of new Set(labels.filter((l, i) => labels.indexOf(l) !== i)))
      errors.push(
        `hardware/${lang}/${cat.slug}.md: two boxes are labelled "${l}"; add the type's name to each label`,
      );
    for (const k of keys) {
      if (found.includes(k) && !opensWithList(page.body, k))
        errors.push(
          `hardware/${lang}/${cat.slug}.md: section {#${k}} must open with its facts list ("- **Good for:** …")`,
        );
    }
  }
  return errors;
}
