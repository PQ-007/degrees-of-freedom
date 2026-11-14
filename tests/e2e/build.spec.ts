import { expect, test } from "@playwright/test";

test.describe("Build page", () => {
  test("shows the spec card, parts and the block diagram", async ({ page }) => {
    await page.goto("en/builds/rocker-bogie-rover/");
    const spec = page.locator("section.spec");
    await expect(spec).toContainText("Build 08");
    await expect(spec).toContainText("●●●○○ medium");
    await expect(spec).toContainText("(3 of 5)");
    await expect(page.locator(".parts li")).toHaveCount(8);
    await expect(page.locator(".parts")).toContainText("Compare: X1 Actuators");
    const diagram = page.locator(".diagram");
    for (const col of ["Sense", "Think", "Act", "Power"])
      await expect(diagram).toContainText(col);
    await expect(diagram.locator(".col.think li")).toHaveText([
      "Microcontroller",
    ]);
  });

  test("steps are numbered through the stages, and ticks are remembered", async ({
    page,
  }) => {
    await page.goto("en/builds/rocker-bogie-rover/");
    const nums = await page.locator(".steps .num").allTextContents();
    expect(nums.map(Number)).toEqual(
      Array.from({ length: 14 }, (_, i) => i + 1),
    );
    const count = page.locator("[data-count]");
    await expect(count).toHaveText("0 of 14 steps done");
    await page.getByLabel("Done: step 1", { exact: true }).check();
    await page.getByLabel("Done: step 12", { exact: true }).check();
    await expect(count).toHaveText("2 of 14 steps done");
    await page.reload();
    await expect(
      page.getByLabel("Done: step 12", { exact: true }),
    ).toBeChecked();
    // Build steps are separate from learned topics.
    await page.goto("en/roadmaps/mars-rover/");
    await expect(page.locator("[data-count]")).toHaveText("0 of 34 learned");
  });

  test("the roadmap ends in it, and the safety advice is cited", async ({
    page,
  }) => {
    await page.goto("en/roadmaps/mars-rover/");
    await page
      .locator(".meta")
      .getByRole("link", { name: "B08 Rocker-bogie rover" })
      .click();
    await expect(page).toHaveURL(/\/en\/builds\/rocker-bogie-rover\/$/);
    await expect(page.locator("#safety")).toBeVisible();
    await expect(page.locator("li#src-osha-lithium")).toContainText("OSHA");
  });

  test("the Builds page and header lead here", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("mn/");
    await page
      .getByRole("navigation", { name: "Сайт" })
      .getByRole("link", { name: "Build-ууд" })
      .click();
    await page.getByRole("link", { name: /B08\s*Rocker-bogie ровер/ }).click();
    await expect(page).toHaveURL(/\/mn\/builds\/rocker-bogie-rover\/$/);
  });
});
