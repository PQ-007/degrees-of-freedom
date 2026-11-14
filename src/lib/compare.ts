// Compare pages as data: pure functions, no Astro, no DOM (tests/unit/compare.test.ts).
//
// The table of each compare page lives in content/compare/<slug>.yaml, with
// every text cell in every language; the prose is content/compare/<lang>/<slug>.md.

export type Localized = Record<string, string>;

export interface CompareColumn {
  key: string;
  type: "rating" | "text";
  label: Localized;
}

export interface CompareRow {
  key: string;
  name: Localized;
  values: Record<string, number | Localized>;
}

export interface CompareTable {
  id: string;
  slug: string;
  nodes: string[];
  columns: CompareColumn[];
  rows: CompareRow[];
}

/** Ratings run 1 (lowest) to 5 (highest). */
export const RATING_MAX = 5;

/** "●●●○○" for a rating of 3. */
export function dots(rating: number): string {
  return "●".repeat(rating) + "○".repeat(RATING_MAX - rating);
}

const missingLangs = (value: Localized, languages: readonly string[]) =>
  languages.filter(
    (l) => !(typeof value[l] === "string" && value[l].trim() !== ""),
  );

/** Every problem with a compare table, as messages naming the page, row and column. */
export function checkCompare(
  table: CompareTable,
  nodeIds: ReadonlySet<string>,
  languages: readonly string[],
  pageLangs: readonly string[],
): string[] {
  const errors: string[] = [];
  const at = `compare/${table.slug}.yaml`;

  for (const lang of languages) {
    if (!pageLangs.includes(lang))
      errors.push(
        `${at} has no ${lang} text: add content/compare/${lang}/${table.slug}.md`,
      );
  }
  for (const id of table.nodes) {
    if (!nodeIds.has(id))
      errors.push(`${at} links node ${id}, which is not in nodes.yaml`);
  }

  const columnKeys = new Set<string>();
  for (const c of table.columns) {
    if (columnKeys.has(c.key))
      errors.push(`${at}: column "${c.key}" is listed twice`);
    columnKeys.add(c.key);
    for (const l of missingLangs(c.label, languages))
      errors.push(`${at}: column "${c.key}" has no ${l} label`);
  }

  const rowKeys = new Set<string>();
  for (const r of table.rows) {
    if (rowKeys.has(r.key))
      errors.push(`${at}: row "${r.key}" is listed twice`);
    rowKeys.add(r.key);
    for (const l of missingLangs(r.name, languages))
      errors.push(`${at}: row "${r.key}" has no ${l} name`);
    for (const c of table.columns) {
      const v = r.values[c.key];
      const cell = `${at}: row "${r.key}", column "${c.key}"`;
      if (v === undefined) {
        errors.push(`${cell} is missing`);
      } else if (c.type === "rating") {
        if (
          typeof v !== "number" ||
          !Number.isInteger(v) ||
          v < 1 ||
          v > RATING_MAX
        ) {
          errors.push(`${cell} must be a rating from 1 to ${RATING_MAX}`);
        }
      } else if (typeof v === "number") {
        errors.push(`${cell} must be text in every language, not a number`);
      } else {
        for (const l of missingLangs(v, languages))
          errors.push(`${cell} has no ${l} text`);
      }
    }
    for (const key of Object.keys(r.values)) {
      if (!columnKeys.has(key))
        errors.push(
          `${at}: row "${r.key}" has a value for unknown column "${key}"`,
        );
    }
  }
  return errors;
}
