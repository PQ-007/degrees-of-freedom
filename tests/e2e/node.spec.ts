import { expect, test } from "@playwright/test";

test.describe("node page", () => {
  test("a citation jumps to its source, and back", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("en/node/what-is-robotics/");
    const first = page.locator("sup.cite a").first();
    await expect(first).toHaveText("1");
    await first.click();
    await expect(page).toHaveURL(/#src-iso-8373-robot$/);
    const source = page.locator("li#src-iso-8373-robot");
    await expect(source).toBeInViewport();
    await expect(source).toContainText("ISO 8373:2021");
    await expect(source).toContainText("Checked:");
    await source.getByRole("link", { name: "Back to the text" }).click();
    await expect(page).toHaveURL(/#ref-iso-8373-robot-1$/);
  });

  test("debated claims say so, in the page's language", async ({ page }) => {
    await page.goto("mn/node/what-is-robotics/");
    await expect(
      page.locator("li#src-moravec-paradox .contested"),
    ).toContainText("Маргаантай:");
    await expect(
      page.locator("li#src-perseverance-landing .contested"),
    ).toHaveCount(0);
  });

  test("node links in the text use the page's language", async ({ page }) => {
    await page.goto("mn/node/what-is-robotics/");
    const link = page.locator("a.node-ref").first();
    await expect(link).toHaveText("Механизм ба бүтэц");
    await expect(link).toHaveAttribute(
      "href",
      /\/mn\/node\/mechanisms-and-structure\/$/,
    );
  });

  test("wide screens: the tier's topics on the left, on this page on the right", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("en/node/what-is-robotics/");
    const tierNav = page.locator("nav.tier-nav");
    await expect(tierNav).toBeVisible();
    await expect(tierNav.locator("a[aria-current='page']")).toContainText(
      "What is robotics",
    );
    await expect(tierNav.locator("li")).toHaveCount(10);
    const toc = page.getByRole("navigation", { name: "On this page" });
    await expect(toc).toBeVisible();
    await toc.getByRole("link", { name: "A short history" }).click();
    await expect(page).toHaveURL(/#a-short-history$/);
    await expect(
      toc.getByRole("link", { name: "A short history" }),
    ).toHaveAttribute("aria-current", "true");
    await expect(page.locator("details.fold").first()).toBeHidden();
  });

  test("narrow screens: both side panels fold into bars above the text", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("en/node/what-is-robotics/");
    await expect(page.locator("nav.tier-nav")).toBeHidden();
    const tierBar = page.locator("details.tier-bar");
    await expect(tierBar).toBeVisible();
    await tierBar.locator("summary").click();
    await expect(tierBar.locator("li")).toHaveCount(10);
    const tocBar = page.locator("details.toc-bar");
    await tocBar.locator("summary").click();
    await tocBar.getByRole("link", { name: "Sources" }).click();
    await expect(page.locator("#sources")).toBeInViewport();
  });

  test("next goes to the next topic in the tier", async ({ page }) => {
    await page.goto("en/node/what-is-robotics/");
    await page
      .getByRole("link", { name: /F1 Geometry and linear algebra →/ })
      .click();
    await expect(page).toHaveURL(/\/en\/node\/geometry-and-linear-algebra\/$/);
  });
});
