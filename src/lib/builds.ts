// Builds as data: pure functions, no Astro, no DOM (tests/unit/builds.test.ts).
//
// A Build is a real robot to make (CONTENT_PLAN.md §6): a spec card, a block
// diagram in Sense / Think / Act columns plus power, and numbered steps in
// stages. Parts are kinds, not products; each links a topic and, where one
// exists, a Compare page.

export type Localized = Record<string, string>;

export interface Build {
  id: string;
  slug: string;
  difficulty: number;
  time: Localized;
  nodes: string[];
  robot?: string | undefined;
  parts: { node: string; hardware?: string | undefined; name: Localized }[];
  diagram: {
    sense: Localized[];
    think: Localized[];
    act: Localized[];
    power: Localized[];
  };
  stages: {
    key: string;
    title: Localized;
    steps: { node?: string | undefined; text: Localized }[];
  }[];
}

export const DIAGRAM_COLUMNS = ["sense", "think", "act", "power"] as const;

/** Every problem with a Build, as messages naming the file and the fix. */
export function checkBuild(
  build: Build,
  ids: {
    nodes: ReadonlySet<string>;
    /** Hardware type keys (src/lib/hardware.ts). */
    hardware: ReadonlySet<string>;
    robots: ReadonlySet<string>;
  },
  languages: readonly string[],
  pageLangs: readonly string[],
): string[] {
  const errors: string[] = [];
  const at = `builds/${build.slug}.yaml`;
  const missing = (v: Localized) => languages.filter((l) => !v[l]?.trim());
  const node = (id: string | undefined, where: string) => {
    if (id && !ids.nodes.has(id))
      errors.push(
        `${at}: ${where} links node ${id}, which is not in nodes.yaml`,
      );
  };

  for (const lang of languages) {
    if (!pageLangs.includes(lang))
      errors.push(
        `${at} has no ${lang} text: add content/builds/${lang}/${build.slug}.md`,
      );
  }
  if (
    !Number.isInteger(build.difficulty) ||
    build.difficulty < 1 ||
    build.difficulty > 5
  ) {
    errors.push(`${at}: difficulty must be 1 to 5`);
  }
  for (const l of missing(build.time))
    errors.push(`${at}: time has no ${l} text`);
  for (const id of build.nodes) node(id, "nodes");
  if (build.robot && !ids.robots.has(build.robot))
    errors.push(`${at} links robot ${build.robot}, which has no teardown`);

  build.parts.forEach((p, i) => {
    node(p.node, `part ${i + 1}`);
    if (p.hardware && !ids.hardware.has(p.hardware)) {
      errors.push(
        `${at}: part ${i + 1} links Hardware entry "${p.hardware}", which doesn't exist yet`,
      );
    }
    for (const l of missing(p.name))
      errors.push(`${at}: part ${i + 1} has no ${l} name`);
  });

  for (const col of DIAGRAM_COLUMNS) {
    const boxes = build.diagram[col];
    if (boxes.length === 0)
      errors.push(`${at}: the diagram's ${col} column is empty`);
    boxes.forEach((b, i) => {
      for (const l of missing(b))
        errors.push(`${at}: diagram ${col} box ${i + 1} has no ${l} label`);
    });
  }

  let n = 0;
  for (const stage of build.stages) {
    for (const l of missing(stage.title))
      errors.push(`${at}: stage "${stage.key}" has no ${l} title`);
    for (const step of stage.steps) {
      n++;
      node(step.node, `step ${n}`);
      for (const l of missing(step.text))
        errors.push(`${at}: step ${n} has no ${l} text`);
    }
  }
  return errors;
}
