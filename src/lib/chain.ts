// The signal chain as data: pure functions, no Astro, no DOM (tests/unit/chain.test.ts).
//
// One moment of a robot's life, stage by stage (CONTENT_PLAN.md §3): Sense
// stages, then Think, then Act, each with its topic, what comes in and what
// goes out.

export type Localized = Record<string, string>;
export const CHAIN_ROLES = ["sense", "think", "act"] as const;
export type ChainRole = (typeof CHAIN_ROLES)[number];

export interface Stage {
  id: string;
  role: ChainRole;
  node: string;
  name: Localized;
  in: Localized;
  out: Localized;
  text: Localized;
}

/** Every problem with the chain, as messages naming the stage and the fix. */
export function checkChain(
  stages: Stage[],
  nodeIds: ReadonlySet<string>,
  languages: readonly string[],
  pageLangs: readonly string[],
): string[] {
  const errors: string[] = [];
  const at = "signal-chain/stages.yaml";
  for (const lang of languages) {
    if (!pageLangs.includes(lang))
      errors.push(
        `signal chain has no ${lang} text: add content/signal-chain/${lang}.md`,
      );
  }
  let last = 0;
  stages.forEach((s, i) => {
    const where = `${at}: stage ${i + 1} (${s.id})`;
    const rank = CHAIN_ROLES.indexOf(s.role);
    if (rank < 0)
      errors.push(`${where} has role "${s.role}"; use sense, think or act`);
    else if (rank < last)
      errors.push(
        `${where} is ${s.role} after a later role; keep Sense, then Think, then Act`,
      );
    else last = rank;
    if (!nodeIds.has(s.node))
      errors.push(`${where} links node ${s.node}, which is not in nodes.yaml`);
    for (const field of ["name", "in", "out", "text"] as const) {
      for (const l of languages) {
        if (!s[field][l]?.trim())
          errors.push(`${where} has no ${l} "${field}"`);
      }
    }
  });
  for (const role of CHAIN_ROLES) {
    if (!stages.some((s) => s.role === role))
      errors.push(`${at} has no ${role} stage`);
  }
  return errors;
}
