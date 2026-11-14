// Every page type × language × theme × width: no sideways scroll, no axe violations.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  { name: "home", path: "{lang}/" },
  { name: "tree", path: "{lang}/tree/" },
  { name: "tree-topic", path: "{lang}/tree/#M5" },
  { name: "node", path: "{lang}/node/classical-control/" },
  { name: "node-full", path: "{lang}/node/what-is-robotics/" },
  { name: "signal-chain", path: "{lang}/signal-chain/" },
  { name: "compare-index", path: "{lang}/compare/" },
  { name: "compare", path: "{lang}/compare/actuators/" },
  { name: "robots-index", path: "{lang}/robots/" },
  { name: "robot", path: "{lang}/robots/planetary-rover/" },
  { name: "roadmaps-index", path: "{lang}/roadmaps/" },
  { name: "roadmap", path: "{lang}/roadmaps/mars-rover/" },
  { name: "builds-index", path: "{lang}/builds/" },
  { name: "build", path: "{lang}/builds/rocker-bogie-rover/" },
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
