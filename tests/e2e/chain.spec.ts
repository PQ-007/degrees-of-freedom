import { expect, test } from "@playwright/test";

test.describe("signal chain", () => {
  test("shows 14 stages in Sense, Think and Act, and the first one in detail", async ({
    page,
  }) => {
    await page.goto("en/signal-chain/");
    for (const [role, count] of [
      ["sense", 5],
      ["think", 4],
      ["act", 5],
    ] as const) {
      await expect(page.locator(`.col.${role} .stage`)).toHaveCount(count);
    }
    await expect(page.locator(".stage").first()).toHaveAttribute(
      "aria-current",
      "step",
    );
    const shown = page.locator(".detail:visible");
    await expect(shown).toHaveCount(1);
    await expect(shown.locator("h3")).toContainText("Something to measure");
  });

  test("picking a stage shows it; Previous and Next walk the chain and wrap around", async ({
    page,
  }) => {
    await page.goto("en/signal-chain/");
    await page.locator('.stage[data-stage="control"]').click();
    await expect(page).toHaveURL(/#stage-control$/);
    const shown = page.locator(".detail:visible");
    await expect(shown.locator("h3")).toContainText("Control");
    await expect(shown).toContainText(
      "A command: a speed, a torque or a position target",
    );
    await expect(shown.locator("h3")).toBeFocused();
    await shown.getByRole("link", { name: "10 Command over a bus →" }).click();
    await expect(page.locator(".detail:visible h3")).toContainText(
      "Command over a bus",
    );
    await page.goto("en/signal-chain/#stage-motion");
    await page
      .locator(".detail:visible")
      .getByRole("link", { name: "1 Something to measure →" })
      .click();
    await expect(page.locator(".detail:visible h3")).toContainText(
      "Something to measure",
    );
  });

  test("each stage links its topic, and the text cites its sources", async ({
    page,
  }) => {
    await page.goto("mn/signal-chain/#stage-current");
    await expect(page.locator(".detail:visible")).toContainText(
      "L4 Хөдөлгүүрийн удирдлага",
    );
    await expect(page.locator(".prose h2")).toHaveCount(3);
    await expect(page.locator("section.sources li")).toHaveCount(3);
  });

  test("is in the header", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("en/");
    await page
      .getByRole("navigation", { name: "Site" })
      .getByRole("link", { name: "Signal chain" })
      .click();
    await expect(page).toHaveURL(/\/en\/signal-chain\/$/);
  });
});
