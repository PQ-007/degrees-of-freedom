import { expect, test } from "@playwright/test";

const TEMPLATE = [
  "job",
  "body",
  "actuators",
  "power",
  "sensors",
  "compute",
  "communication",
  "software",
  "control",
  "hard-problems",
  "examples",
  "start",
];

test.describe("robot teardown", () => {
  test("has the 12 template sections with the same anchors in both languages", async ({
    page,
  }) => {
    for (const lang of ["en", "mn"]) {
      await page.goto(`${lang}/robots/planetary-rover/`);
      const ids = await page
        .locator(".prose h2")
        .evaluateAll((hs) => hs.map((h) => h.id));
      expect(ids).toEqual(TEMPLATE);
    }
  });

  test("the drawing is labelled and its numbers match the list of parts", async ({
    page,
  }) => {
    await page.goto("en/robots/planetary-rover/");
    const svg = page.locator(".drawing svg");
    await expect(svg).toHaveAttribute("role", "img");
    await expect(svg).toHaveAttribute("aria-label", /six-wheeled rover/);
    await expect(page.locator(".drawing [data-callout]")).toHaveCount(7);
    await expect(page.locator(".legend li")).toHaveCount(7);
  });

  test("a part links to its section and topic, and lights up its number", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("en/robots/planetary-rover/");
    const part = page.locator('.legend li[data-part="4"]');
    await expect(part).toContainText("Act");
    await part.hover();
    await expect(page.locator('.drawing [data-callout="4"]')).toHaveClass(
      /hot/,
    );
    await part
      .getByRole("link", { name: "Six wheels on a rocker-bogie suspension" })
      .click();
    await expect(page).toHaveURL(/#body$/);
    await expect(page.locator("h2#body")).toBeInViewport();
    await page
      .locator('.legend li[data-part="1"]')
      .getByRole("link", { name: "C10 Sensors: exteroceptive" })
      .click();
    await expect(page).toHaveURL(/\/en\/node\/exteroceptive-sensors\/$/);
  });

  test("facts are cited, and the Robots page and header lead here", async ({
    page,
  }) => {
    await page.goto("en/");
    await page
      .getByRole("navigation", { name: "Site" })
      .getByRole("link", { name: "Robots" })
      .click();
    await page.getByRole("link", { name: /R5\s*Planetary rover/ }).click();
    await expect(page).toHaveURL(/\/en\/robots\/planetary-rover\/$/);
    await expect(page.locator("section.sources li")).toHaveCount(8);
    await expect(page.locator("li#src-perseverance-power")).toContainText(
      "NASA JPL",
    );
  });
});
