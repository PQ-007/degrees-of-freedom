// Roadmaps as data: pure functions, no Astro, no DOM (tests/unit/roadmaps.test.ts).
//
// A roadmap is an ordered path through the tech tree for one goal ("build a
// Mars-rover-style robot"): stages of steps, each a node marked must or
// helpful with one line on why this goal needs it, then later topics.

export type Localized = Record<string, string>;
export type Level = "must" | "helpful";

export interface RoadmapStep {
  node: string;
  level: Level;
  why: Localized;
}

export interface Roadmap {
  slug: string;
  robot?: string | undefined;
  stages: { key: string; title: Localized; steps: RoadmapStep[] }[];
  later: { node: string; why: Localized }[];
}

/** Every node on the path, in order (later topics last). */
export function pathNodes(roadmap: Roadmap): string[] {
  return [
    ...roadmap.stages.flatMap((s) => s.steps.map((st) => st.node)),
    ...roadmap.later.map((l) => l.node),
  ];
}

/** Every problem with a roadmap, as messages naming the roadmap, step and fix. */
export function checkRoadmap(
  roadmap: Roadmap,
  needsOf: ReadonlyMap<string, readonly string[]>,
  robotIds: ReadonlySet<string>,
  languages: readonly string[],
  pageLangs: readonly string[],
): string[] {
  const errors: string[] = [];
  const at = `roadmaps/${roadmap.slug}.yaml`;
  const missing = (v: Localized) => languages.filter((l) => !v[l]?.trim());

  for (const lang of languages) {
    if (!pageLangs.includes(lang))
      errors.push(
        `${at} has no ${lang} text: add content/roadmaps/${lang}/${roadmap.slug}.md`,
      );
  }
  if (roadmap.robot && !robotIds.has(roadmap.robot)) {
    errors.push(`${at} links robot ${roadmap.robot}, which has no teardown`);
  }

  const order = pathNodes(roadmap);
  const seen = new Set<string>();
  order.forEach((id) => {
    if (seen.has(id)) errors.push(`${at}: ${id} is on the path twice`);
    seen.add(id);
  });

  for (const stage of roadmap.stages) {
    for (const l of missing(stage.title))
      errors.push(`${at}: stage "${stage.key}" has no ${l} title`);
  }
  const steps = [...roadmap.stages.flatMap((s) => s.steps), ...roadmap.later];
  for (const step of steps) {
    for (const l of missing(step.why))
      errors.push(`${at}: ${step.node} has no ${l} "why"`);
    const needs = needsOf.get(step.node);
    if (!needs) {
      errors.push(`${at}: ${step.node} is not a node in nodes.yaml`);
      continue;
    }
    // A topic comes after anything it needs that is also on this path.
    const at_ = order.indexOf(step.node);
    for (const need of needs) {
      const n = order.indexOf(need);
      if (n > at_)
        errors.push(
          `${at}: ${step.node} needs ${need}, so ${need} must come before it on the path`,
        );
    }
  }
  return errors;
}
