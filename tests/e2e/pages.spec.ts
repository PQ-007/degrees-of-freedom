// Every page type × language × theme × width: no sideways scroll, no axe violations.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  { name: "home", path: "{lang}/" },
  { name: "tree", path: "{lang}/tree/" },
  { name: "node", path: "{lang}/node/classical-control/" },
  { name: "search", path: "{lang}/search/?q=control" },
  { name: "404", path: "404.html" },
];
const langs = ["en", "mn"] as const;
const themes = ["light", "dark"] as const;
const widths = [360, 390, 768, 1024];

for (const p of pages) {
  for (const lang of p.path.includes("{lang}") ? langs : (["en"] as const)) {
    for (const theme of themes) {
      for (const width of widths) {
        test(`${p.name} · ${lang} · ${theme} · ${width}px`, async ({
          page,
        }) => {
          await page.emulateMedia({
            colorScheme: theme,
            reducedMotion: "reduce",
          });
          await page.setViewportSize({ width, height: 800 });
          await page.goto(p.path.replace("{lang}", lang));

          await expect(page.locator("html")).toHaveAttribute("lang", lang);
          await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            theme,
          );
          if (p.name === "search")
            await expect(
              page.locator("[data-search-results] li").first(),
            ).toBeVisible();

          const overflow = await page.evaluate(
            () =>
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          );
          expect(overflow, "page scrolls sideways").toBeLessThanOrEqual(0);

          const axe = await new AxeBuilder({ page }).analyze();
          const summary = axe.violations.map(
            (v) =>
              `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
          );
          expect(summary).toEqual([]);
        });
      }
    }
  }
}
