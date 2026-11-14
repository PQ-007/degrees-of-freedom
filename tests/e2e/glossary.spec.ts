import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { parse } from "yaml";

const TERMS = (
  parse(
    readFileSync(
      new URL("../../content/glossary/terms.yaml", import.meta.url),
      "utf8",
    ),
  ) as unknown[]
).length;

test.describe("glossary", () => {
  test("groups the terms by tier, T0 first, with each term's topic", async ({
    page,
  }) => {
    await page.goto("en/glossary/");
    const tiers = page.locator("section.tier h2");
    await expect(tiers.first()).toContainText("T0");
    await expect(tiers.first()).toContainText("Foundations");
    const t0 = await page
      .locator("section.tier")
      .first()
      .locator("dfn")
      .allTextContents();
    // Sorted in the page's language, and holding the Foundations terms.
    expect(t0).toEqual(
      [...t0].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
    );
    expect(t0).toEqual(expect.arrayContaining(["Robot", "Radian", "Torque"]));
    const encoder = page.locator("#encoder");
    await expect(encoder).toContainText("C9");
    await expect(
      encoder.getByRole("link", { name: "Odometry" }),
    ).toHaveAttribute("href", "#odometry");
  });

  test("the Mongolian page shows the English term too", async ({ page }) => {
    await page.goto("mn/glossary/");
    await expect(page.locator("#encoder dfn")).toHaveText("Энкодер");
    await expect(page.locator("#encoder .english")).toContainText("Encoder");
    // Terms kept in English don't repeat it.
    await expect(page.locator("#bus .english")).toHaveCount(0);
  });

  test("the filter narrows the list, in either language, and says how many match", async ({
    page,
  }) => {
    await page.goto("mn/glossary/");
    const filter = page.getByLabel("Нэр томьёо шүүх");
    await filter.fill("encoder");
    await expect(page.locator(".entry:visible")).toHaveCount(1);
    await expect(page.locator("[data-count]")).toHaveText("1 нэр томьёо");
    await expect(page.locator("section.tier:visible")).toHaveCount(1);
    await filter.fill("zzzz");
    await expect(page.locator(".entry:visible")).toHaveCount(0);
    await expect(page.locator("[data-count]")).toContainText("zzzz");
    await filter.fill("");
    await expect(page.locator(".entry:visible")).toHaveCount(TERMS);
  });

  test("a term in the text links to its entry, and the footer links the glossary", async ({
    page,
  }) => {
    await page.goto("en/node/what-is-robotics/");
    const link = page.locator("a.term-ref", { hasText: "encoder" }).first();
    await expect(link).toHaveAttribute("title", /measures how far a shaft/);
    await link.click();
    await expect(page).toHaveURL(/\/en\/glossary\/#encoder$/);
    await expect(page.locator("#encoder")).toBeInViewport();
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Glossary" })
      .click();
    await expect(page).toHaveURL(/\/en\/glossary\/$/);
  });

  test("a topic's page lists the terms it teaches", async ({ page }) => {
    await page.goto("en/node/proprioceptive-sensors/");
    const row = page.locator(".meta dt", { hasText: "Terms" }).locator("+ dd");
    await expect(row.getByRole("link")).toHaveText([
      "Encoder",
      "IMU (inertial measurement unit)",
      "Sensor",
    ]);
  });
});
