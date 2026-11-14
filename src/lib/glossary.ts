// The glossary as data: pure functions, no Astro, no DOM (tests/unit/glossary.test.ts).
//
// Each term belongs to the topic that teaches it, so the page groups terms by
// that topic's tier (chosen by the user, 2026-11-14). Pages link a term with
// [[~id]] or [[~id|text]] (src/lib/remark-atlas.ts); every term has to be
// linked from at least one page in every language, so none is orphaned.

export type Localized = Record<string, string>;

export interface Term {
  id: string;
  /** The topic that teaches it; its tier places the term on the page. */
  node: string;
  term: Localized;
  def: Localized;
  see?: string[];
}

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** A term link in Markdown: [[~id]] or [[~id|text]]. */
export const TERM_LINK = /\[\[~([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g;

/** The term IDs linked in a piece of Markdown, in order (repeats kept). */
export function termLinks(markdown: string): string[] {
  return [...markdown.matchAll(TERM_LINK)].map((m) => m[1] ?? "");
}

/**
 * Every problem with the glossary, as messages naming the term and the fix.
 * `linked` maps each language to the term IDs its pages link.
 */
export function checkGlossary(
  terms: Term[],
  nodeIds: ReadonlySet<string>,
  languages: readonly string[],
  linked: ReadonlyMap<string, ReadonlySet<string>>,
): string[] {
  const errors: string[] = [];
  const at = "glossary/terms.yaml";
  const ids = new Set<string>();
  for (const t of terms) {
    if (ids.has(t.id)) errors.push(`${at}: ${t.id} is listed twice`);
    ids.add(t.id);
  }
  for (const t of terms) {
    const where = `${at}: ${t.id}`;
    if (!ID.test(t.id))
      errors.push(`${where}: an ID is lowercase words joined by -`);
    if (!nodeIds.has(t.node))
      errors.push(`${where} belongs to ${t.node}, which is not in nodes.yaml`);
    for (const field of ["term", "def"] as const) {
      for (const l of languages) {
        if (!t[field][l]?.trim())
          errors.push(`${where} has no ${l} "${field}"`);
      }
    }
    for (const s of t.see ?? []) {
      if (s === t.id) errors.push(`${where} lists itself under "see"`);
      else if (!ids.has(s))
        errors.push(`${where}: "see" names ${s}, which is not a term`);
    }
  }
  for (const l of languages) {
    const used = linked.get(l) ?? new Set();
    for (const id of used) {
      if (!ids.has(id))
        errors.push(`a ${l} page links [[~${id}]], which is not in ${at}`);
    }
    for (const t of terms) {
      if (!used.has(t.id))
        errors.push(
          `${at}: ${t.id} is never linked from a ${l} page; link it where the text uses it, with [[~${t.id}]]`,
        );
    }
  }
  return errors;
}

export interface TierGroup {
  tier: number;
  terms: Term[];
}

/**
 * The terms grouped by their topic's tier, T0 first, each tier sorted by the
 * term in `lang` (that language's alphabet). Empty tiers are left out.
 */
export function groupByTier(
  terms: Term[],
  tierOf: ReadonlyMap<string, number>,
  lang: string,
): TierGroup[] {
  const groups = new Map<number, Term[]>();
  for (const t of terms) {
    const tier = tierOf.get(t.node);
    if (tier === undefined) continue;
    groups.set(tier, [...(groups.get(tier) ?? []), t]);
  }
  const collator = new Intl.Collator(lang, { sensitivity: "base" });
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([tier, list]) => ({
      tier,
      terms: list.sort((a, b) =>
        collator.compare(a.term[lang] ?? a.id, b.term[lang] ?? b.id),
      ),
    }));
}

/** What the filter box matches: the term in every language and the definition. */
export function searchText(t: Term, lang: string): string {
  return [...Object.values(t.term), t.def[lang] ?? ""].join(" ").toLowerCase();
}
