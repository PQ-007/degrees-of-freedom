import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default defineConfig(
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  tseslint.configs.recommended,
  astro.configs.recommended,
);
