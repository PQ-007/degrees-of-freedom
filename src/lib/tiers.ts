import type { MessageKey } from "../i18n/en";

/** The seven tiers of the tech tree (docs/CONTENT_PLAN.md §2). M1 moves these into content data. */
export const tiers = [0, 1, 2, 3, 4, 5, 6].map((n) => ({
  id: `T${n}`,
  className: `t${n}`,
  nameKey: `tier.${n}` as MessageKey,
}));
