import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Hardware", () => {
  test("the header's Hardware tab lists the categories with their types", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("en/");
    const nav = page.getByRole("navigation", { name: "Site" });
    await expect(nav.getByRole("link", { name: "Compare" })).toHaveCount(0);
    await nav.getByRole("link", { name: "Hardware" }).click();
    await expect(page).toHaveURL(/\/en\/hardware\/$/);
    const card = page.getByRole("link", { name: /H1\s*Motors and actuators/ });
    await expect(card).toContainText("Stepper motor");
    await card.click();
    await expect(page).toHaveURL(/\/en\/hardware\/motors\/$/);
  });

  test("each type has an entry that opens with its facts, and models are cited", async ({
    page,
  }) => {
    await page.goto("en/hardware/motors/");
    await expect(page.locator("h1")).toHaveText("Motors and actuators");
    const entries = page.locator(".prose h2[id]");
    await expect(entries).toHaveCount(11); // ten types and "Which one?"
    await page
      .locator(".jump")
      .getByRole("link", { name: "Stepper motor" })
      .click();
    await expect(page).toHaveURL(/#stepper$/);
    const facts = page.locator("#stepper + ul");
    await expect(facts).toContainText("Good for:");
    await expect(facts).toContainText("200 steps per turn");
    await expect(page.locator("section.sources li")).toHaveCount(10);
    await expect(page.locator("li#src-dynamixel-xl430")).toContainText(
      "ROBOTIS",
    );
  });

  test("the comparison is folded at the end, sorts, and links back to each entry", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("en/hardware/motors/");
    const fold = page.locator("details#compare");
    await expect(fold).not.toHaveAttribute("open");
    await fold.locator("summary").click();
    const rows = fold.locator("table.compare tbody tr");
    await expect(rows).toHaveCount(10);
    const harmonicPrecision = fold
      .locator("table.compare tr", { hasText: "Harmonic-drive joint" })
      .locator("td")
      .nth(3);
    await expect(harmonicPrecision).toContainText("●●●●●");
    await expect(harmonicPrecision).toContainText("(5 of 5)");
    const firstRow = rows.first().locator("th");
    await fold
      .getByLabel("Sort by")
      .selectOption({ label: "Torque for its size: highest first" });
    await expect(firstRow).toHaveText("Hydraulic actuator");
    await fold.getByLabel("Sort by").selectOption({ label: "The usual order" });
    await firstRow.getByRole("link").click();
    await expect(page).toHaveURL(/#gearmotor$/);
  });

  test("phones get the comparison as cards, in Mongolian, and pass axe", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("mn/hardware/motors/");
    await page.locator("details#compare summary").click();
    await expect(page.locator(".table-frame")).toBeHidden();
    const cards = page.locator(".option-cards > li");
    await expect(cards).toHaveCount(10);
    await page.getByLabel("Эрэмбэлэх").selectOption({ index: 1 });
    await expect(cards.first().locator("h3")).toHaveText("Гидравлик актуатор");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
  });

  test("a topic page links the kinds of part it teaches", async ({ page }) => {
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
    await expect(page).toHaveURL(/\/en\/hardware\/motors\/#stepper$/);
  });
});
