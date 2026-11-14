import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Hardware", () => {
  test("the Hardware tab shows a row of picture cards per category", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("en/");
    const nav = page.getByRole("navigation", { name: "Site" });
    await expect(nav.getByRole("link", { name: "Compare" })).toHaveCount(0);
    await nav.getByRole("link", { name: "Hardware" }).click();
    await expect(page).toHaveURL(/\/en\/hardware\/$/);
    const row = page.getByRole("region", { name: "Motors and actuators" });
    const cards = row.locator(".tile");
    await expect(cards).toHaveCount(10);
    // Every card has a drawing (decorative: the card's name says what it is).
    await expect(row.locator(".tile svg[aria-hidden='true']")).toHaveCount(10);
    await expect(cards.first()).toContainText("Brushed DC gearmotor");
  });

  test("Next and Previous scroll the row, and turn off at the ends", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("en/hardware/");
    const row = page.getByRole("region", { name: "Motors and actuators" });
    const back = row.getByRole("button", { name: /Scroll back/ });
    const on = row.getByRole("button", { name: /Scroll on/ });
    const track = row.locator("[data-track]");
    await expect(back).toBeDisabled();
    await on.click();
    await expect
      .poll(() => track.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(100);
    await expect(back).toBeEnabled();
  });

  test("a card opens its page: drawing, facts, models and sources", async ({
    page,
  }) => {
    await page.goto("en/hardware/");
    await page.locator(".tile", { hasText: "Stepper motor" }).click();
    await expect(page).toHaveURL(/\/en\/hardware\/motors\/stepper\/$/);
    await expect(page.locator("h1")).toHaveText("Stepper motor");
    await expect(page.locator(".hero svg")).toHaveAttribute(
      "aria-label",
      /square stepper motor/,
    );
    const facts = page.locator(".entry > ul").first();
    await expect(facts).toContainText("Good for:");
    await expect(facts).toContainText("200 steps per turn");
    await expect(page.locator("aside.examples")).toContainText("NEMA 17");
    await expect(page.locator("section.sources li")).toHaveCount(2);
  });

  test("the comparison is folded, sorts, and its rows open the other pages", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("en/hardware/motors/stepper/");
    const fold = page.locator("details.compare-fold");
    await expect(fold).not.toHaveAttribute("open");
    await fold.locator("summary").click();
    await expect(fold.locator(".advice")).toContainText("Start from the job");
    const rows = fold.locator("table.compare tbody tr");
    await expect(rows).toHaveCount(10);
    await fold
      .getByLabel("Sort by")
      .selectOption({ label: "Torque for its size: highest first" });
    await expect(rows.first().locator("th")).toHaveText("Hydraulic actuator");
    await rows.first().getByRole("link").click();
    await expect(page).toHaveURL(/\/en\/hardware\/motors\/hydraulic\/$/);
  });

  test("More shows the category as cards, this one marked", async ({
    page,
  }) => {
    await page.goto("en/hardware/motors/qdd/");
    const more = page.getByRole("region", {
      name: "More motors and actuators",
    });
    await expect(more.locator(".tile")).toHaveCount(10);
    await expect(more.locator(".tile[aria-current='page']")).toContainText(
      "Quasi-direct drive",
    );
  });

  test("phones, in Mongolian: stacked page, cards in the fold, and axe passes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("mn/hardware/motors/qdd/");
    await page.locator("details.compare-fold summary").click();
    await expect(page.locator(".table-frame")).toBeHidden();
    const cards = page.locator(".option-cards > li");
    await expect(cards).toHaveCount(10);
    await page.getByLabel("Эрэмбэлэх").selectOption({ index: 1 });
    await expect(cards.first().locator(".card-title")).toHaveText(
      "Гидравлик актуатор",
    );
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
  });

  test("topic and Build pages link the parts' pages", async ({ page }) => {
    await page.goto("en/node/electric-motors/");
    const row = page
      .locator(".meta dt", { hasText: "Hardware" })
      .locator("+ dd");
    await expect(row.getByRole("link")).toHaveText([
      "Brushed DC gearmotor",
      "Stepper motor",
      "Brushless motor + gearbox",
    ]);
    await row.getByRole("link", { name: "Stepper motor" }).click();
    await expect(page).toHaveURL(/\/en\/hardware\/motors\/stepper\/$/);
    await page.goto("en/builds/rocker-bogie-rover/");
    await page
      .getByRole("link", { name: "Hardware: Brushed DC gearmotor" })
      .click();
    await expect(page).toHaveURL(/\/en\/hardware\/motors\/gearmotor\/$/);
  });

  test("hovering a card plays its drawing's motion; reduced motion keeps it still", async ({
    browser,
    baseURL,
  }) => {
    const moving = async (reducedMotion: "reduce" | "no-preference") => {
      const context = await browser.newContext({
        ...(baseURL ? { baseURL } : {}),
        reducedMotion,
      });
      const page = await context.newPage();
      await page.goto("en/hardware/");
      const tile = page.locator(".tile", { hasText: "Stepper motor" });
      await tile.hover();
      const name = await tile
        .locator("g.step")
        .evaluate((g) => getComputedStyle(g).animationName);
      await context.close();
      return name;
    };
    expect(await moving("no-preference")).toBe("art-turn");
    expect(await moving("reduce")).toBe("none");
  });
});
