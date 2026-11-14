# Degrees of Freedom: Site Plan

Draft 2, 2026-11-14. The content is in `CONTENT_PLAN.md`; this file covers the tech stack, the structure of the code and the look. Update it when a decision changes.

## Decisions so far

- **Stack:** Astro (the user, 2026-11-14).
- **Simulation:** MuJoCo running in the browser (WebAssembly), wherever a demo needs real physics (the user, 2026-11-14).
- **Look:** restrained neo-brutalism on Sand to Tetris's black and white, with cyberpunk accent colours only in fixed, meaningful places, a deep dark theme, and the review changes (hard shadows on what you press, grey in dark mode, unboxed reading column, little uppercase mono, separate data colours, compact tree nodes, drafting grid). Agreed by the user, 2026-11-14. Details in §4.
- **Project name:** **Degrees of Freedom** (DOF), replacing "Sand to Robot" (the user, 2026-11-14). The repo and folder follow: `degrees-of-freedom`.
- **Section name:** the hands-on section is **Builds** (was "Projects"; the user, 2026-11-14). Build IDs are `B01`–`B12`.

## 1. What the site has to do

| Need | Because |
|---|---|
| ~120 doc pages in 2–3 languages, each a real page with its own URL | Tech-tree nodes, compare pages, teardowns, roadmaps, Builds |
| Structured data, checked at build time | Nodes have prerequisites, tiers, links to compare pages and teardowns; a broken link or a prerequisite loop must fail the build |
| Tables generated from data | 15 compare pages with fixed columns, sortable and filterable; one source for the table, the mobile cards and the robot matrix |
| A graph view | The tech tree, roadmaps highlighted on it |
| Interactive demos inside the prose | ~60 demos: plots, diagrams, physics simulations, 3D robots |
| Full-text search | An atlas you search rather than read in order |
| Math | Go-deeper boxes with equations |
| Static hosting, no backend | GitHub Pages, like Sand to Tetris; progress stays in the browser |

## 2. Stack

| Area | Choice | Why |
|---|---|---|
| Site framework | **Astro** (static output), no UI framework | Each page is pre-rendered HTML (fast, searchable, shareable links); content collections with schemas check the data at build time; built-in i18n routing; no JS on a page unless it needs it |
| Language | TypeScript (strict) | Same as Sand to Tetris |
| Content | Markdown + custom elements (`<pid-demo>` in the text), frontmatter checked by zod schemas | Same approach as Sand to Tetris, without MDX or React |
| Data | YAML for nodes, compare tables, robots, roadmaps, glossary, sources | Easy to edit and translate; one source of truth for tables, cards and the graph |
| Demos | Web Components (a pure, tested model in TS + a thin element), loaded when they scroll into view | Sand to Tetris's demo pattern (`kit.ts`), ported |
| **Physics simulation** | **MuJoCo WebAssembly build** (official bindings; package and version pinned at setup) for anything with rigid bodies, joints, contacts or legs: pendulum, cart-pole, arms, grippers, rocker-bogie, quadruped, humanoid balance | The same engine robotics researchers use, so what the learner sees behaves like the real tools; robots are described in MJCF, which the Simulation node (S3) teaches |
| 3D rendering | **Three.js**, drawing MuJoCo's state each frame; also static 3D views in teardowns | Standard and well supported |
| Small 2D models | Own TS models where a full engine is overkill (a single wheel's PID loop, a Kalman train, an RC circuit) | Readable, testable, instant to load |
| Learned policies | Trained offline (in Python, outside the site), exported to ONNX, run in the browser with **ONNX Runtime Web** inside a MuJoCo scene | Shows a real RL policy driving a real-physics robot (the quadruped and humanoid demos, the Signal Chain's RL walkthrough) |
| Plots | Plain SVG for static figures; **uPlot** for live time-series | uPlot is tiny and fast enough for 60 fps traces |
| Tech-tree layout | **Tier steps + topic cards**: a step rail with T0–T6 (T0 first), one tier's topics at a time as cards with their needs and unlocks as links | Reads like a course and is easy to navigate. Replaced two earlier versions the user found hard to read (bands of chips with lines to the focused topic, then bands with a side panel), 2026-11-14 |
| Math | KaTeX (remark-math + rehype-katex), rendered at build time | No math JS in the browser |
| Search | **Pagefind** (static index built after the site) | Runs in the browser, multilingual, no server |
| Progress | localStorage (learned nodes, chosen roadmap), export/import as a file | Same as Sand to Tetris; no accounts |
| Tests | Vitest (models, data checks), Playwright (pages × languages × widths), axe for accessibility | |
| Lint | ESLint, Prettier, markdownlint, `astro check` | |
| CI / hosting | GitHub Actions → GitHub Pages | Free and static |

Versions are pinned exactly (M0, 2026-11-14). Astro is held at 7.3.8 because 7.4.x needs Node ≥ 22.23.4 and the local Node is 22.22.2; bump it when Node is upgraded. TypeScript is 6.0.x (typescript-eslint supports < 6.1). Fonts (Geist, Geist Mono, with Cyrillic) are self-hosted from Fontsource, not loaded from Google.

### How MuJoCo demos load

The MuJoCo WebAssembly module is several megabytes, so it never loads by accident:

1. A sim demo first shows a still frame of its scene (rendered at build time or a saved picture) and a **Run simulation** button.
2. On click, the WASM module and the scene's MJCF model load once per page visit and are cached by the browser.
3. Controls under the scene (sliders for gains, torque limits, noise; play / pause / step / reset; speed) and live plots of the signals beside it.
4. If WebAssembly or WebGL is unavailable, the demo shows a recorded replay of the same scene with a note.
5. One shared `<mujoco-scene>` element handles loading, the render loop, pausing when off-screen, `prefers-reduced-motion` (starts paused) and cleanup; each demo only supplies its model, its controller and its controls.

Models live in `content/models/*.xml` (MJCF), each with a short note on what it simplifies.

## 3. Code structure

```text
degrees-of-freedom/
  CLAUDE.md
  docs/                    PLAN.md, CONTENT_PLAN.md, TERMS (per language)
  content/                 everything learners read
    tree/nodes.yaml                       the tree's structure: ID, tier, slug, needs (one file, no language)
    nodes/en/F0-what-is-robotics.md      one file per node: title, summary, text (<ID>-<slug>.md)
    nodes/mn/…                            same file names per language
    compare/actuators.yaml                rows + columns (data)
    compare/en/actuators.md               prose: how to choose, notes per option
    robots/en/mars-rover.md               teardowns (frontmatter = the template's facts)
    roadmaps/quadruped.yaml               node lists: must / helpful / later
    builds/en/B02-line-follower.md
    signal-chain/en.md
    models/*.xml                          MJCF scenes for the MuJoCo demos
    policies/*.onnx                       learned policies used by demos
    glossary/en.yaml, mn.yaml
    sources.yaml                          every source with its checked date
  src/
    content.config.ts      schemas: node, compare, robot, roadmap, build, glossary, source
    pages/[lang]/          index, tree, node/[slug], compare/[slug], robots/[slug],
                           roadmaps/[slug], builds/[slug], signal-chain, glossary, search
    layouts/               Base, Doc (3 columns), Wide (tree, compare, signal chain)
    components/            Astro: NodeHeader, PrereqChips, CompareTable, RobotMatrix,
                           TechTree, ConnectsTo, Figure, Callout, GoDeeper, SourceList
    demos/models/          pure TS models, no DOM (tested)
    demos/elements/        Web Components, one per demo
    sim/                   <mujoco-scene>: loader, render loop, controls, replay fallback
    lib/                   graph (prereqs, cycles, layout), progress, i18n, theme
    styles/                tokens.css, base.css, layout.css, look.css
    i18n/                  interface strings: en.ts, mn.ts (typed against en.ts), ja.ts later
    vendor/hairline/       line figures (as in Sand to Tetris)
  public/
  tests/                   unit (models, data) and e2e (Playwright)
  .github/workflows/
```

### URLs

```text
/degrees-of-freedom/en/                          home
/degrees-of-freedom/en/tree/                     tech tree (graph + list)
/degrees-of-freedom/en/node/pid-control/         a node page
/degrees-of-freedom/en/compare/actuators/        a compare page
/degrees-of-freedom/en/robots/mars-rover/        a teardown
/degrees-of-freedom/en/robots/                   all robots side by side (matrix)
/degrees-of-freedom/en/roadmaps/quadruped/       a roadmap
/degrees-of-freedom/en/builds/line-follower/     a Build
/degrees-of-freedom/en/signal-chain/
/degrees-of-freedom/mn/…                         same paths in Mongolian
```

Slugs are English in every language, so a page's link is the same apart from the language prefix.

### Build-time checks (the build fails if one breaks)

- Every prerequisite, "used by", compare link, robot link, roadmap entry and Build's node list points to a node that exists.
- The prerequisite graph has no cycles, and a node's prerequisites sit in the same or lower tiers.
- A node lists only direct prerequisites: one that another prerequisite already brings in is an error.
- Every compare row has every column of its table.
- Every glossary term is linked from at least one page; every `[[link]]` resolves.
- Every source cited exists in `sources.yaml` with a checked date.
- Every page exists in every complete language (staged languages fall back to English and are marked).
- Every custom element used in Markdown is registered; every MJCF model a demo names exists and loads in MuJoCo (a test).

## 4. Look

**Neo-brutalist structure, used sparingly, with disciplined colour.** The frame is bold and plain: 2px borders, square corners, bold headings, hard shadows on the few things you press. The palette is Sand to Tetris's black and white. Colour is never decoration: it marks *which tier* something belongs to, *sense / think / act*, and data, in small fixed places. The content stays the focus. Agreed with the user on 2026-11-14 after a design review.

The agreed sample is `docs/style-preview.html` (open it in a browser; it has a light/dark toggle). It is the visual reference for M0.

### Base

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F4F3EE` | `#050506` | Page (paper / deep black) |
| `--surface` | `#FFFFFF` | `#0C0C10` | Cards, tables, code |
| `--ink` | `#0B0B10` | `#E4E4E8` | Text |
| `--line` | `#0B0B10` | `#E4E4E8` | Borders (white in dark: the user, 2026-11-14; was a dim grey) |
| `--muted` | `#55555F` | `#8A8A96` | Secondary text |
| `--rule` | `#D9D8D2` | `#1C1C23` | Thin inner lines (table rows) |
| `--head-bg` / `--head-fg` | `#0B0B10` / `#F4F3EE` | `#15151B` / `#E4E4E8` | Table header rows |
| `--primary-bg` / `--primary-fg` | `#0B0B10` / `#F4F3EE` | `#D4D4DA` / `#050506` | Primary button |
| `--grid` | ink at 13% | ink at 7% | Drafting dot grid |
| `--error` | `#B42318` | `#E5675C` | Real trouble only |

The dark theme is deliberately deep: near-black page, dark surfaces, white frame lines, grey shadows, dark table headers, deep accents (the user, 2026-11-14).

- **Borders:** 2px solid `--line` on cards, tables, buttons, inputs, code blocks and callouts. Square corners.
- **Hard shadows:** `4px 4px 0`, no blur, ink in light mode, **grey (`#3A3A44`) in dark mode** (not the white frame-line colour). At rest only on buttons and the three home entry cards; hovering a button shifts it into its shadow. Everything else you can press (cards, chips, tier steps) is flat at rest and lifts into a `2px`–`4px` shadow on hover (the user, 2026-11-14).
- **Dark-filled things get a grey shadow:** under a primary button, or the current tier step, an ink shadow would merge with the fill, so those use `--shade` (`#8A8A96` in light, `#3A3A44` in dark).
- **Type:** Geist, bold and tight for headings (800), normal weight for text, 600 for buttons, chips and table headers. **Uppercase mono only for IDs (`T3 · M5`) and small eyebrow labels**; everything else is normal case, which also keeps Mongolian readable. Body 17px, line height 1.6, about 68 characters per line.
- **Visible structure:** the header sits on a 2px rule; sections are separated by 2px rules; table header rows are inverted in light and dark grey in dark.
- **Drafting grid:** a faint 20px dot grid behind canvas-like areas only (home hero, tech tree, signal chain). Never behind reading text.
- **Buttons:** primary uses `--primary-bg`; secondary is surface with a border. Never coloured.
- **Links:** ink, 1px underline at rest, 2px on hover.
- **Header:** the language switch is a small button like the theme toggle (beside it on wide screens, inside the menu on phones).
- **Focus:** a 3px ink ring with a 2px gap.

### Accents

Two roles. **Marks** (tier squares and bars) are deep in dark mode, so they sit back. **Data** (plot traces, simulation highlights) stay bright, so thin lines read on black.

| Colour | Light mark | Light data | Dark mark | Dark data | Means |
|---|---|---|---|---|---|
| yellow | `#FACC15` | `#CA9A04` | `#94800F` | `#E0BE12` | T1 Components · **Act** |
| orange | `#FB923C` | `#EA6C0A` | `#9E4A1A` | `#E57F2A` | T2 Low-level integration |
| lime | `#84CC16` | `#65A30D` | `#5A8420` | `#8DC62E` | T3 Motion & control |
| cyan | `#06B6D4` | `#0891B2` | `#136F84` | `#1EB3D0` | T4 Perception · **Sense** |
| magenta | `#D946EF` | `#C026D3` | `#84287A` | `#CC3DB4` | T5 Intelligence · **Think** |
| violet | `#8B5CF6` | `#7C3AED` | `#57459A` | `#8A6EDB` | T6 Systems |

**T0 Foundations** has no hue: its mark is grey (`#8A8A96`) in both themes (the user, 2026-11-14: grey in light mode too). It is the neutral base everything stands on.

### Where colour is allowed (and nowhere else)

1. **The tier square:** a 13px square with a 2px border, filled with the tier colour, before a tier ID (`■ T3 · M5`).
2. **The tier bar:** an 8px bar along the top of a node card and a Build's spec card; on a node page, an 8px rule in the tier colour above the article.
3. **Sense / Think / Act:** the square before each heading in the Signal Chain and before teardown callouts.
4. **Data:** plot traces and the highlighted part of a simulation or figure.

So: no coloured buttons, tags, chips, table headers, links, headings, text or backgrounds. Chips are bordered with a tier square inside.

**Colour budget:** a reading page (node, Build, teardown section) shows one accent, its own tier's. Several accents appear together only on overview pages (home tier stack, tech tree, signal chain, robots matrix) and in plots.

Colour never carries meaning alone: tiers keep their `T3` label, Sense/Think/Act are written out, states have words.

### Figures

Hairline line drawings in ink, as in Sand to Tetris, with **one accent line**: the part the figure is about (the encoder in a motor drawing, the lidar on a rover). Teardown callouts are numbered, in ink boxes, with a Sense / Think / Act square.

### Home figure

A Hairline figure made with the `hairline-create` skill.

**Chosen:** a 6-axis robot arm reaching, each joint marked with its rotation arc and numbered 1–6: six degrees of freedom made visible, in ink, with the arc of the joint in focus in an accent colour.

### Page layouts

| Page | Layout |
|---|---|
| **Home** | Hero on the drafting grid: title, one-line idea, the home figure; three entry cards with resting hard shadows (By topic · By robot · By question), the tier stack T0–T6, **T0 first at the top** (ink rows, each with its tier square), "Continue" if there is progress |
| **Tech tree** | A step rail of the seven tiers, **T0 first, top to bottom** (the user: begin from the bottom tier, don't put the highest on top), each with its square, name and count; the chosen tier's topics as cards (tier bar, ID, title linking to the page, summary, Needs and Unlocks chips). A chip jumps to that topic in its tier; `#T3` opens a tier, `#M5` a topic. Previous/next tier buttons. Phones: the rail becomes seven equal tabs. Without JS all tiers show in order. Roadmap highlighting comes with roadmaps |
| **Node** | Three columns as in Sand to Tetris chapters: tree nav, article (max ~46rem, **not boxed**: an 8px tier-colour rule on top, then plain text; only callouts, code and go-deeper boxes have borders), "On this page". Breadcrumb `■ T3 › M5`; prerequisite and "used by" chips (bordered, tier square). Bottom: a small "How it connects" graph, next nodes, "Mark as learned" |
| **Compare** | Bordered table (no shadow), inverted header row, sticky first row and column, sortable, filter chips, "pin two to compare". Ratings `●●●○○` with a word. Phones: one card per option, or pick two side by side |
| **Robot teardown** | Line drawing with numbered callouts; the 12 template sections with the same anchors on every robot; a link to the matrix |
| **Robots matrix** | Robot types as columns, the template's rows as rows |
| **Signal chain** | On the drafting grid: three bordered columns (Sense · Think · Act), each headed by its square and name in ink; the steps as bordered blocks; horizontal on wide screens, vertical on phones; clicking a step shows its signal |
| **Roadmap** | The tree filtered to the roadmap, plus an ordered checklist |
| **Build** | A spec card (`BUILD 05`, difficulty, time, nodes used, part categories), then build steps |
| **Sim demo** | Scene on the left, controls and live plots on the right (stacked on phones), in one bordered frame; traces in the bright data colours |

### Status of a node

Not started: an empty square. Reading: a half-filled square. Learned: a filled square with a check. In ink, each always with its word.

### Responsive and accessible (same rules as Sand to Tetris)

- No sideways page scroll at 360 px; wide tables, the tree and sim scenes scroll or scale inside their own frame.
- Side panels fold into bars below ~1280 px (nav) and ~900 px (ToC); the header menu folds under 640 px.
- Everything works from the keyboard, including the tree, demos and sim controls; every diagram has an `aria-label`, every state a text label; `prefers-reduced-motion` respected (sims start paused, hover shifts are turned off).
- Playwright checks every page type × language × theme × 360/390/768/1024 px, plus axe and a contrast check of every token pair in use.

## 5. Milestones

| # | Milestone | Done when |
|---|---|---|
| M0 | Scaffold: Astro, TS, lint, tests, CI, Pages deploy, tokens, fonts, light/dark, en/mn routing | An empty site in the new look deploys and passes checks |
| M1 | Content model: schemas, data checks, all ~75 nodes as stubs (ID, tier, prerequisites, one-line summary), tech-tree page (graph + list), search | The full tree is browsable and searchable |
| M2 | Page types: node, compare, robot, roadmap, Build, signal chain, glossary, with one real example of each | Each layout exists with real content |
| M3 | `<mujoco-scene>` with one sim demo (cart-pole with PID sliders) and its replay fallback | A MuJoCo demo runs on desktop and phone, and degrades cleanly |
| M4 | Foundations (F0–F9) written, with demos and figures | Tier 0 is complete in English and Mongolian |
| M5 | Tier 1 + Compare X1–X8 | Hardware section complete |
| M6 | Signal Chain + three flagship teardowns + their roadmaps (with the RL-policy quadruped demo) | The "how it connects" story works end to end |
| M7+ | Tiers 2–6, remaining compare pages, robots, Builds | Following `CONTENT_PLAN.md` §11 |

## 6. Decided 2026-11-14 (the user)

1. **Home figure:** the 6-axis arm, each joint with its rotation arc numbered 1–6, the joint in focus in an accent colour. Made with the `hairline-create` skill.
2. **Languages:** English and Mongolian complete from launch (every page needs its Mongolian text in the same change, as in Sand to Tetris); Japanese added later in stages.
3. **Repo:** its own repo. The existing GitHub repo `PQ-007/sand-to-robot` is renamed to `degrees-of-freedom`; the site is served at `/degrees-of-freedom/`.

M0 done (2026-11-14), on the `dev` branch. M1 done (2026-11-14): 71 node stubs in English and Mongolian, the checked tree data, the tech-tree page (graph + list), stub node pages and Pagefind search. The prerequisites are a first draft for review. Next: M2.
