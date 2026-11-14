import { expect, test } from "@playwright/test";

test.describe("compare page", () => {
  test("shows every option in a table with ratings in words", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("en/compare/actuators/");
    await expect(page.locator("h1")).toHaveText("Actuators");
    const rows = page.locator("table.compare tbody tr");
    await expect(rows).toHaveCount(10);
    await expect(rows.first().locator("th")).toHaveText("Brushed DC gearmotor");
    await expect(page.locator("table.compare thead th")).toHaveCount(9);
    // A rating shows dots and a word, and screen readers also hear "n of 5".
    const harmonicPrecision = page
      .locator("table.compare tr", { hasText: "Harmonic-drive joint" })
      .locator("td")
      .nth(3);
    await expect(harmonicPrecision).toContainText("●●●●●");
    await expect(harmonicPrecision).toContainText("very high");
    await expect(harmonicPrecision).toContainText("(5 of 5)");
    await expect(page.locator(".option-cards")).toBeHidden();
  });

  test("sorting reorders the table, and the usual order comes back", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("en/compare/actuators/");
    const firstRow = page
      .locator("table.compare tbody tr")
      .first()
      .locator("th");
    await page
      .getByLabel("Sort by")
      .selectOption({ label: "Torque for its size: highest first" });
    await expect(firstRow).toHaveText("Hydraulic actuator");
    await page
      .getByLabel("Sort by")
      .selectOption({ label: "Cost: lowest first" });
    await expect(firstRow).toHaveText("Brushed DC gearmotor");
    await page
      .getByLabel("Sort by")
      .selectOption({ label: "Speed: lowest first" });
    await expect(firstRow).toHaveText("Stepper motor");
    await page.getByLabel("Sort by").selectOption({ label: "The usual order" });
    await expect(firstRow).toHaveText("Brushed DC gearmotor");
  });

  test("phones get one card per option, sorted the same way", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("mn/compare/actuators/");
    await expect(page.locator(".table-frame")).toBeHidden();
    const cards = page.locator(".option-cards > li");
    await expect(cards).toHaveCount(10);
    await page.getByLabel("Эрэмбэлэх").selectOption({ index: 1 });
    await expect(cards.first().locator("h2")).toHaveText("Гидравлик актуатор");
  });

  test("the text cites its sources and links its topics", async ({ page }) => {
    await page.goto("en/compare/actuators/");
    await expect(page.locator("section.sources li")).toHaveCount(5);
    await expect(page.locator("li#src-atlas-electric")).toContainText(
      "Boston Dynamics",
    );
    await expect(page.locator(".meta")).toContainText("C4 Electric motors");
    await page.getByRole("link", { name: "C5 Actuator packages" }).click();
    await expect(page).toHaveURL(/\/en\/node\/actuator-packages\/$/);
    await expect(page.locator(".meta")).toContainText("X1 Actuators");
  });

  test("the Compare page lists it, and the header links there", async ({
    page,
  }) => {
    await page.goto("en/");
    await page
      .getByRole("navigation", { name: "Site" })
      .getByRole("link", { name: "Compare" })
      .click();
    await expect(page).toHaveURL(/\/en\/compare\/$/);
    await page.getByRole("link", { name: /X1\s*Actuators/ }).click();
    await expect(page).toHaveURL(/\/en\/compare\/actuators\/$/);
  });
});
