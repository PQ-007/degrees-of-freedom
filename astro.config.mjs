// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import remarkMath from "remark-math";
import { remarkAtlas } from "./src/lib/remark-atlas.ts";

// GitHub Pages serves the site under /<repo-name>/. CI passes it in BASE_PATH;
// the default matches the repo, so local builds use the same URLs.
const base = process.env.BASE_PATH ?? "/degrees-of-freedom/";
const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  site: "https://pq-007.github.io",
  base,
  trailingSlash: "always",
  output: "static",
  i18n: {
    locales: ["en", "mn"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  markdown: {
    // remark-math finds $…$ and $$…$$; remark-atlas renders them with KaTeX
    // and handles citations, links, figures (src/lib/remark-atlas.ts).
    remarkPlugins: [remarkMath, [remarkAtlas, { base, root }]],
  },
});
