// @ts-check
import { defineConfig } from "astro/config";

// GitHub Pages serves the site under /<repo-name>/. CI passes it in BASE_PATH;
// the default matches the repo, so local builds use the same URLs.
const base = process.env.BASE_PATH ?? "/degrees-of-freedom/";

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
});
