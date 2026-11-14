# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Degrees of Freedom (DOF): a static, browser-only atlas of the whole of robotics, a sibling of Sand to Tetris (github.com/PQ-007/sand-to-tetris). It is **not** a "build one robot" course: it maps the field as a tech tree of topics (tiers T0–T6, each node a page with prerequisites), compare pages, a sense → think → act signal chain, robot teardowns, roadmaps per robot type and a ladder of hands-on Builds (B01–B12). English and Mongolian are complete from launch; Japanese comes later.

- What the site covers: `docs/CONTENT_PLAN.md`.
- Stack, code structure, look and milestones: `docs/PLAN.md`. Read it before starting a milestone, and update it when a decision changes.
- The agreed visual reference: `docs/style-preview.html`.

## Status

- M0 (scaffold): done. Astro (static), strict TypeScript, en/mn routing, tokens and the look from the style preview, self-hosted Geist fonts, light/dark theme, Vitest, Playwright + axe, lint, CI, GitHub Pages deploy from `main`.
- Next: M1 (content model, ~75 node stubs, the tech-tree page, search). Keep this section up to date when a milestone lands.

## Commands

```bash
npm install
npm run dev                  # http://localhost:4321/degrees-of-freedom/
npm run build                # static site into dist/ (BASE_PATH=/repo-name/ overrides the base)
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
- Prettier ignores `*.md` on purpose (prose and tables are hand-formatted) and `docs/style-preview.html` (kept as reviewed).
- Commit messages: write them to a file and use `git commit -F`; backticks inside a double-quoted `-m` run as shell commands.

## Architecture (so far)

- `src/pages/[lang]/…` is every page, generated once per language from `languages` in `src/lib/i18n.ts`. `src/pages/index.astro` sends readers to `/mn/` or `/en/` by browser language; `src/pages/404.astro` is bilingual (GitHub Pages has one 404 page).
- Interface strings: `src/i18n/en.ts` is the source; `src/i18n/mn.ts` is typed `Record<MessageKey, string>`, so a missing key fails the type check. Use `t(lang, key)`. Slugs are English in every language; only the `/en/` or `/mn/` prefix changes (`localePath`, `switchLang`).
- Styles: `src/styles/tokens.css` (colours, fonts, both themes; tier carriers `.t0`–`.t6`, `.sense/.think/.act` set `--c` mark and `--d` data colour), `base.css` (elements), `layout.css` (frame, header, footer), `look.css` (labels, IDs, tier square/bar, buttons, chips, cards, drafting grid). Page-specific CSS lives in the page's `<style>`.
- Theme: an inline script in `Base.astro` sets `data-theme` before first paint (stored choice in `localStorage["dof-theme"]`, else the system preference); `src/lib/theme.ts` + `ThemeToggle.astro` switch it.

## Rules

1. **Colour discipline** (`docs/PLAN.md` §4): colour appears only as tier squares, tier bars, Sense/Think/Act squares and data (plot traces, sim highlights). No coloured buttons, chips, links, headings, text or backgrounds. One accent per reading page. Colour never carries meaning alone: tiers keep their `T3` label, states have words. The user rejected both a colour-heavy and a soft version.
2. **Both languages in the same change.** Every new string or page gets its Mongolian text in the same commit. Terminology follows Sand to Tetris's rule (`docs/mn/TERMS.md` there): use a Mongolian word only when it is already in use; otherwise keep the English term in Latin letters (e.g. tech tree). Flag new Mongolian wording for the user to review.
3. **Facts are cited.** Every factual or historical claim in content needs an entry in `content/sources.yaml` with how and when it was checked. Never guess; mark contested items as contested.
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
