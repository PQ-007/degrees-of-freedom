# Degrees of Freedom

A browser atlas of the whole of robotics: a tech tree of topics with their
prerequisites, side-by-side compare pages, the sense → think → act signal chain,
robot teardowns, roadmaps per robot type and a ladder of hands-on Builds. In
English and Mongolian.

Sibling of [Sand to Tetris](https://github.com/PQ-007/sand-to-tetris).

- What it covers: [`docs/CONTENT_PLAN.md`](docs/CONTENT_PLAN.md)
- How it's built and how it looks: [`docs/PLAN.md`](docs/PLAN.md)
- The agreed look: open [`docs/style-preview.html`](docs/style-preview.html) in a browser

## Develop

Needs Node 22.12 or newer.

```bash
npm install
npm run dev          # http://localhost:4321/degrees-of-freedom/
npm run build        # static site into dist/
npm test             # unit tests (Vitest)
npm run test:e2e     # browser tests on the built site (Playwright); run npm run build first
npm run lint         # astro check, eslint, prettier, markdownlint
```

The first time, install the browser for the e2e tests: `npx playwright install chromium`.

## License

Code: [MIT](LICENSE). Text: [CC BY-SA 4.0](docs/LICENSE.md).
