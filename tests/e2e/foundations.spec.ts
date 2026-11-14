import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("F1 Geometry and linear algebra", () => {
  test("the frame demo moves P in the world's frame but not the robot's", async ({
    page,
  }) => {
    await page.goto("en/node/geometry-and-linear-algebra/#try");
    const demo = page.locator("frames-demo");
    await expect(demo.getByRole("img")).toBeVisible();
    const readouts = demo.locator(".sim-readouts");
    await expect(readouts).toContainText("(1.60, 0.60) m");
    await demo.getByLabel("Heading θ").fill("90");
    await expect(readouts).toContainText("90° = 1.57 rad");
    await expect(readouts).toContainText(
      "P in the robot's frame(1.60, 0.60) m",
    );
    await expect(readouts).toContainText(
      "P in the world's frame(0.90, 2.60) m",
    );
    await expect(demo.locator(".demo-brackets")).toHaveText(
      /0\.00\s*-1\.00\s*1\.00\s*0\.00/,
    );
  });

  test("the figure is described, the maths has MathML, and Go deeper opens", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("mn/node/geometry-and-linear-algebra/");
    await expect(page.locator(".fig svg")).toHaveAttribute(
      "aria-label",
      /тойрог/,
    );
    await expect(page.locator(".fig figcaption")).toContainText("Нэгж тойрог");
    await page.locator("details.deeper summary").click();
    await expect(page.locator("details.deeper .katex-display")).toHaveCount(3);
    await expect(page.locator("details.deeper math").first()).toBeAttached();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
  });

  test("the topic page lists the terms it teaches", async ({ page }) => {
    await page.goto("en/node/geometry-and-linear-algebra/");
    const row = page.locator(".meta dt", { hasText: "Terms" }).locator("+ dd");
    await expect(row.getByRole("link")).toHaveText([
      "Coordinate frame",
      "Radian",
      "Rotation matrix",
      "Vector",
    ]);
  });
});

test.describe("F2 Calculus and differential equations", () => {
  test("the step slider and presets show following, overshooting and blowing up", async ({
    page,
  }) => {
    await page.goto("en/node/calculus-and-differential-equations/#try");
    const demo = page.locator("euler-demo");
    const what = demo.locator(".sim-readouts");
    await expect(what).toContainText("Follows the curve");
    await demo.getByRole("button", { name: "h = τ: 0.3 s" }).click();
    await expect(
      demo.getByRole("button", { name: "h = τ: 0.3 s" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(what).toContainText("Steps6");
    await demo.getByLabel("Step size h").fill("0.45");
    await expect(what).toContainText("Overshoots, then settles");
    await demo.getByRole("button", { name: "Too big: 0.7 s" }).click();
    await expect(what).toContainText("Swings wider and wider: unstable");
    await expect(demo.locator("circle.point")).toHaveCount(3);
  });

  test("Go deeper opens with its equations, and the page passes axe on a phone", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("mn/node/calculus-and-differential-equations/#try");
    await page.locator("euler-demo .demo-plot").waitFor();
    await page.locator("details.deeper summary").click();
    await expect(page.locator("details.deeper .katex-display")).toHaveCount(4);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
  });
});

test.describe("F3 Probability and statistics", () => {
  test("averaging N readings narrows the spread to about σ/√N, at a cost in time", async ({
    page,
  }) => {
    await page.goto("en/node/probability-and-statistics/#try");
    const demo = page.locator("noise-demo");
    const out = demo.locator(".sim-readouts dd");
    await demo.getByLabel("Readings averaged, N").fill("1");
    // One reading at a time: both spreads are about σ = 0.08 m.
    expect(
      Math.abs(parseFloat((await out.nth(1).textContent()) ?? "") - 0.08),
    ).toBeLessThan(0.01);
    await demo.getByLabel("Readings averaged, N").fill("16");
    await expect(out.nth(2)).toHaveText("0.020 m");
    expect(
      Math.abs(parseFloat((await out.nth(1).textContent()) ?? "") - 0.02),
    ).toBeLessThan(0.004);
    await expect(out.nth(3)).toHaveText("320 ms");
    const before = await out.nth(0).textContent();
    await demo.getByRole("button", { name: "New readings" }).click();
    await expect(out.nth(0)).not.toHaveText(before ?? "");
  });

  test("the bell-curve figure is described, and the page passes axe on a phone", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("mn/node/probability-and-statistics/#try");
    await page.locator("noise-demo .demo-plot").waitFor();
    await expect(page.locator(".fig svg")).toHaveAttribute(
      "aria-label",
      /хонх/,
    );
    await page.locator("details.deeper summary").click();
    await expect(page.locator("details.deeper .katex-display")).toHaveCount(6);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
  });
});

test.describe("F4 Optimization", () => {
  test("presets show rolling, zigzagging and diverging; steps move the line", async ({
    page,
  }) => {
    await page.goto("en/node/optimization/#try");
    const demo = page.locator("fit-demo");
    const out = demo.locator(".sim-readouts");
    await expect(out).toContainText("Steps0");
    await demo.getByRole("button", { name: "1 step" }).click();
    await expect(out).toContainText("Steps1");
    await demo.getByRole("button", { name: "Good: 0.2" }).click();
    await expect(out).toContainText("Rolls straight downhill");
    await demo.getByRole("button", { name: "Zigzag: 0.35" }).click();
    await expect(out).toContainText(
      "Zigzags across the valley, but gets there",
    );
    await demo.getByRole("button", { name: "Too big: 0.45" }).click();
    await expect(out).toContainText("Bounces higher and higher: diverges");
    await expect(out).toContainText(
      "Best (least squares)a = 1.109, b = -0.054",
    );
    await demo.getByRole("button", { name: "Reset" }).click();
    await expect(out).toContainText("Steps0");
  });

  test("the page passes axe on a phone, with Go deeper open", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("mn/node/optimization/#try");
    await page.locator("fit-demo .demo-plot").first().waitFor();
    await page.getByRole("button", { name: "Хэт том: 0.45" }).click();
    await page.locator("details.deeper summary").click();
    await expect(page.locator("details.deeper .katex-display")).toHaveCount(3);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
  });
});
