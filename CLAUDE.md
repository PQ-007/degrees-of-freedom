# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Degrees of Freedom (DOF): a static, browser-only atlas of the whole of robotics, a sibling of Sand to Tetris (github.com/PQ-007/sand-to-tetris). It is **not** a "build one robot" course: it maps the field as a tech tree of topics (tiers T0–T6, each node a page with prerequisites), compare pages, a sense → think → act signal chain, robot teardowns, roadmaps per robot type and a ladder of hands-on Builds (B01–B12). English and Mongolian are complete from launch; Japanese comes later.

- What the site covers: `docs/CONTENT_PLAN.md`.
- Stack, code structure, look and milestones: `docs/PLAN.md`. Read it before starting a milestone, and update it when a decision changes.
- The agreed visual reference: `docs/style-preview.html`.

## Status

- M0 (scaffold): done. Astro (static), strict TypeScript, en/mn routing, tokens and the look from the style preview, self-hosted Geist fonts, light/dark theme, Vitest, Playwright + axe, lint, CI, GitHub Pages deploy from `main`.
- M1 (content model): done. 71 nodes (`content/tree/nodes.yaml` + `content/nodes/<lang>/`), build-time checks, the tech-tree page (graph + list), stub node pages, Pagefind search, header nav with a phone menu. The prerequisites are a first draft awaiting the user's review.
- M2 (page types): in progress, one page type at a time, each shown to the user. Done: the full node page with F0 What is robotics (cited, en + mn); the compare page with X1 Actuators (table + how to choose, chosen by the user); the robot teardown with R5 Planetary rover (drawing + sections, chosen by the user); the roadmap with the Mars-rover-style path (ordered path + checklist, chosen by the user) and "Learned" progress; the Build page with B08 Rocker-bogie rover (spec card + steps, chosen by the user); the Signal chain (chain + step-through, a rover walk-through, chosen by the user). Next: glossary.
- Keep this section up to date when a step lands.

## Commands

```bash
npm install
npm run dev                  # http://localhost:4321/degrees-of-freedom/
npm run build                # static site into dist/, then the Pagefind index (BASE_PATH=/repo-name/ overrides the base)
npm test                     # Vitest unit tests (tests/unit)
npm run test:e2e             # Playwright on the built site (build first); serves dist/ with tests/e2e/serve.mjs
npm run lint                 # astro check, eslint, prettier --check, markdownlint-cli2
npm run format               # prettier --write

npx vitest run tests/unit/i18n.test.ts -t "<name>"   # one unit test
npx playwright test -g "home · mn · dark · 360px"    # one e2e test
```

- Branches: work goes to `dev`; CI runs on `main`, `dev` and PRs; only `main` deploys to GitHub Pages.
- **Astro is pinned to 7.3.8** because Astro 7.4.x needs Node ≥ 22.23.4 and the local Node (`~/.local/bin/node`) is 22.22.2. Bump Astro when Node is upgraded. TypeScript stays on 6.0.x: typescript-eslint supports < 6.1.
- `astro preview` backgrounds itself when it detects an AI agent (`AI_AGENT` is set), so Playwright doesn't use it: `tests/e2e/serve.mjs` serves `dist/` like GitHub Pages does (folder index, 404.html fallback). Stop a stray background preview with `npx astro preview stop`.
- After changing `src/lib/remark-atlas.ts`, clear Astro's content cache (`rm -rf node_modules/.astro`): rendered Markdown is cached and won't pick up the plugin change otherwise. CI always builds clean.
- Prettier ignores `*.md` on purpose (prose and tables are hand-formatted) and `docs/style-preview.html` (kept as reviewed).
- Commit messages: write them to a file and use `git commit -F`; backticks inside a double-quoted `-m` run as shell commands.

## Architecture (so far)

- `src/pages/[lang]/…` is every page, generated once per language from `languages` in `src/lib/i18n.ts`. `src/pages/index.astro` sends readers to `/mn/` or `/en/` by browser language; `src/pages/404.astro` is bilingual (GitHub Pages has one 404 page).
- Interface strings: `src/i18n/en.ts` is the source; `src/i18n/mn.ts` is typed `Record<MessageKey, string>`, so a missing key fails the type check. Use `t(lang, key)`. Slugs are English in every language; only the `/en/` or `/mn/` prefix changes (`localePath`, `switchLang`).
- Styles: `src/styles/tokens.css` (colours, fonts, both themes; tier carriers `.t0`–`.t6`, `.sense/.think/.act` set `--c` mark and `--d` data colour), `base.css` (elements), `layout.css` (frame, header, footer), `look.css` (labels, IDs, tier square/bar, buttons, chips, cards, drafting grid). Page-specific CSS lives in the page's `<style>`.
- Tech tree: `content/tree/nodes.yaml` holds the language-independent structure (ID, tier, slug, needs); `content/nodes/<lang>/<ID>-<slug>.md` holds each node's title, summary and text. `src/lib/tree.ts` (pure, unit-tested) checks everything: missing or higher-tier needs, cycles, needs implied by other needs, a page per node per language, stray files. `src/lib/atlas.ts` loads the collections, runs the checks and throws, so a broken tree fails the build. Pages call `getAtlas(lang)`.
- Tree page (`src/pages/[lang]/tree.astro` + `src/lib/tree-view.ts`): tier steps + topic cards, T0 first (the user asked to begin from the bottom tier and not show the highest on top). One tier shows at a time; the hash picks it (`#T3`) or a topic (`#M5`, its card scrolled to and marked). Rail steps, previous/next and the Needs/Unlocks chips are plain anchors, so without JS every tier shows. Two earlier layouts were rejected as hard to read: chips with lines to the focused topic, and chips with a side panel.
- Search: Pagefind indexes only elements with `data-pagefind-body` (node pages), one index per `<html lang>`; `src/lib/search.ts` drives our own results list. It works only on a build (`npm run build`), not in `npm run dev`.
- Node pages (`src/pages/[lang]/node/[slug].astro`): the tier's topics on the left, the article (tier rule, breadcrumb, needs/used-by chips, text, Sources, previous/next) in the middle, "On this page" on the right; below 1200px the left panel folds into a bar above the text, below 900px the right one too. Stubs show a note instead of text.
- Markdown syntax (`src/lib/remark-atlas.ts`, a remark plugin; Astro 7 needs `@astrojs/markdown-remark` for remark plugins): `[@source-id]` is a citation, numbered by first use, listed under Sources from `content/sources.yaml`; `[[C4]]` links to a node with its title in the page's language, `[[C4|text]]` with your own text (not inside table cells: `|` splits them). An unknown source or node fails the build. Real named products and robots go in `<aside class="examples">` ("Real examples", dated), not in the running text (the user, 2026-11-14).
- Compare pages: the table is `content/compare/<slug>.yaml` (columns of type `rating` 1–5 or `text`; every text cell as `en:`/`mn:` in block style; ratings are relative guides and the page says so), the prose is `content/compare/<lang>/<slug>.md` (How to choose, then each option, citations, Real examples). `src/lib/compare.ts` checks every cell and translation at build time. The page (`src/pages/[lang]/compare/[slug].astro`) has one Sort-by select that reorders the table and the phone cards; node pages listed in `nodes:` link back to it.
- Robot teardowns: `content/robots/<slug>.yaml` (ID, the drawing file, numbered callouts with role sense/think/act/none, topic and template section, labels in en/mn), `content/robots/<slug>.svg` (an original line drawing; each callout is a `<g data-callout="n">`; lines use classes `thin`/`thick`, colours come from CSS so the drawing follows the theme), `content/robots/<lang>/<slug>.md` (title, summary, figureAlt, glance rows; then the 12 template sections in order, each `## Title {#anchor}` with the anchors in `TEMPLATE`, `src/lib/robots.ts`). The build checks the sections, the callouts against the drawing, topics and translations.
- Roadmaps: `content/roadmaps/<slug>.yaml` (stages of steps, each `node`, `level` must/helpful and a one-line `why` in en/mn; `later` topics; an optional `robot`), `content/roadmaps/<lang>/<slug>.md` (how to use it, then build it). `src/lib/roadmaps.ts` checks that every step comes after any step it needs. Node and robot pages link to the roadmaps they're on.
- Progress: `src/lib/progress.ts` keeps learned topic IDs in `localStorage["dof-learned"]` (this browser only); roadmap checkboxes and the node page's "Learned" checkbox share it and stay in sync across tabs. Hidden without JS (`.js-only`).
- Builds: `content/builds/<slug>.yaml` (ID B01–B12, difficulty 1–5, time, topics, robot, parts as kinds not products with a topic and an optional Compare page, the block diagram's sense/think/act/power boxes, steps in stages), `content/builds/<lang>/<slug>.md` (common failures, safety with sources, make it harder). `src/lib/builds.ts` checks it all. Done steps are saved apart from learned topics (`localStorage["dof-build-steps"]`, IDs like `B08:3`). A roadmap's `build:` and a Build's `robot:` link the three page types together.
- Signal chain: `content/signal-chain/stages.yaml` (14 stages in order, each sense/think/act with its topic, name, in, out and text in en/mn; collections come back sorted by ID, so `getChain` restores the file's order) and `content/signal-chain/<lang>.md` (loops, a rover end to end, where it breaks). `src/lib/chain.ts` checks the Sense → Think → Act order. The page shows one stage at a time from the hash (`#stage-control`), with Previous/Next that wrap around.
- Shared pieces: `src/components/SourceList.astro` (the numbered Sources list) and `src/styles/prose.css` (Markdown text, citations, the examples box).
- Theme: an inline script in `Base.astro` sets `data-theme` before first paint (stored choice in `localStorage["dof-theme"]`, else the system preference); `src/lib/theme.ts` + `ThemeToggle.astro` switch it.

## Rules

1. **Colour discipline** (`docs/PLAN.md` §4): colour appears only as tier squares, tier bars, Sense/Think/Act squares and data (plot traces, sim highlights). No coloured buttons, chips, links, headings, text or backgrounds. One accent per reading page. Colour never carries meaning alone: tiers keep their `T3` label, states have words. The user rejected both a colour-heavy and a soft version.
2. **Both languages in the same change.** Every new string or page gets its Mongolian text in the same commit. Terminology follows Sand to Tetris's rule (`docs/mn/TERMS.md` there): use a Mongolian word only when it is already in use; otherwise keep the English term in Latin letters (e.g. tech tree). Flag new Mongolian wording for the user to review.
3. **Facts are cited.** Every factual or historical claim in content needs an entry in `content/sources.yaml` (claim, sources, `checked` with a date) and a `[@id]` in the text. Never guess. When sources disagree or a claim is debated, add `uncertain: { en, mn }`; the page shows it as "Debated". Both languages of a page cite the same sources (unit-tested).
4. **Accessibility:** everything works from the keyboard; every state has a text label; `prefers-reduced-motion` is respected; the e2e suite runs axe on every page type × language × theme × 360/390/768/1024 px and fails on any violation or sideways scroll.
5. **Original content.** Don't copy text, figures or course structure from other robotics courses or sites.

## Working style

- The user guides the build step by step: do one milestone (or the step they ask for) at a time and don't jump ahead.
- The user is learning while building. When you make a non-obvious design choice, explain it in a sentence or two.
- After each step: run `npm run lint`, `npm test`, `npm run build` and `npm run test:e2e`, summarise what was built and how to try it.
- Make small, well-described commits.

## Code style

- TypeScript `strictest` (Astro preset), ES modules, prettier defaults.
- No UI framework: Astro components for pages, Web Components for demos (each self-contained, configured by attributes).
- Pure logic (models, graph checks, i18n helpers) lives in `src/lib` or `src/demos/models` with no DOM, and has unit tests.
