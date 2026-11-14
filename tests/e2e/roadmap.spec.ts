import { expect, test } from "@playwright/test";

test.describe("roadmap", () => {
  test("is one numbered path in stages, with later topics folded", async ({
    page,
  }) => {
    await page.goto("en/roadmaps/mars-rover/");
    await expect(page.locator(".stage")).toHaveCount(6);
    const numbers = await page.locator(".stage .num").allTextContents();
    expect(numbers.map(Number)).toEqual(
      Array.from({ length: 34 }, (_, i) => i + 1),
    );
    await expect(page.locator(".stage .step").first()).toContainText(
      "F0 What is robotics",
    );
    await expect(page.locator(".stage .step").first()).toContainText("Must");
    await expect(page.locator("details.later")).not.toHaveAttribute("open");
    await expect(page.locator("details.later summary")).toHaveText(
      "Later: 5 topics for when it works",
    );
  });

  test("ticks count towards progress, are remembered, and show on topic pages", async ({
    page,
  }) => {
    await page.goto("en/roadmaps/mars-rover/");
    const count = page.locator("[data-count]");
    await expect(count).toHaveText("0 of 34 learned");
    await page.getByLabel("Learned: F0 What is robotics").check();
    await page.getByLabel("Learned: F7 Electronics basics").check();
    await expect(count).toHaveText("2 of 34 learned");
    // Later topics can be ticked too, but don't count towards the path.
    await page.locator("details.later summary").click();
    await page.getByLabel("Learned: S2 ROS 2").check();
    await expect(count).toHaveText("2 of 34 learned");

    await page.reload();
    await expect(count).toHaveText("2 of 34 learned");
    await expect(
      page.getByLabel("Learned: F7 Electronics basics"),
    ).toBeChecked();

    await page.goto("en/node/electronics-basics/");
    const learned = page.locator(".learn input");
    await expect(learned).toBeChecked();
    await learned.uncheck();
    await page.goto("mn/roadmaps/mars-rover/");
    await expect(page.locator("[data-count]")).toHaveText("34-аас 1 нь сурсан");
  });

  test("links both ways with the robot and the topics", async ({ page }) => {
    await page.goto("en/robots/planetary-rover/");
    await page
      .locator(".meta")
      .getByRole("link", { name: "Mars-rover-style robot" })
      .click();
    await expect(page).toHaveURL(/\/en\/roadmaps\/mars-rover\/$/);
    await page
      .locator(".meta")
      .getByRole("link", { name: "R5 Planetary rover" })
      .click();
    await expect(page).toHaveURL(/\/en\/robots\/planetary-rover\/$/);
    await page.goto("en/node/classical-control/");
    await expect(page.locator(".meta")).toContainText("Mars-rover-style robot");
  });

  test("the header's Roadmap is the topic map; a robot leads to its own roadmap", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("en/");
    const nav = page.getByRole("navigation", { name: "Site" });
    await expect(nav.getByRole("link", { name: "Roadmaps" })).toHaveCount(0);
    await nav.getByRole("link", { name: "Roadmap", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/tree\/$/);
    await expect(page.locator("h1")).toHaveText("Roadmap");
    await page.goto("en/robots/planetary-rover/");
    await page
      .getByRole("link", { name: /Mars-rover-style robot/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/en\/roadmaps\/mars-rover\/$/);
  });
});
