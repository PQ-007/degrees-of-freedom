// Tier 1 topics (M5): each page's demo and figure, and axe on a phone.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("C1 Mechanisms and structure", () => {
  test("equal links reach the shoulder; a stiff elbow leaves a hole; a stiff shoulder a fan", async ({
    page,
  }) => {
    await page.goto("en/node/mechanisms-and-structure/#try");
    const demo = page.locator("reach-demo");
    const out = demo.locator(".sim-readouts");
    await expect(out).toContainText("Farthest reach0.50 m");
    await expect(out).toContainText("Nearest reach0.10 m");
    await expect(out).toContainText("Workspace area0.75 m²");
    await demo.getByLabel("Link 1 (shoulder to elbow)").fill("25");
    await demo.getByLabel("Link 2 (elbow to tip)").fill("25");
    await expect(out).toContainText("Nearest reach0.00 m");
    await demo.getByLabel("Elbow can turn").fill("90");
    await expect(out).toContainText("Nearest reach0.35 m");
    const full = parseFloat(
      (await out.locator("dd").nth(2).textContent()) ?? "0",
    );
    await demo.getByLabel("Shoulder can turn").fill("45");
    const fan = parseFloat(
      (await out.locator("dd").nth(2).textContent()) ?? "0",
    );
    expect(fan).toBeLessThan(full / 2);
    await expect(demo.locator(".ray")).toHaveCount(4);
  });

  test("the joints are described, and the page passes axe on a phone", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("mn/node/mechanisms-and-structure/#try");
    await page.locator("reach-demo .demo-reach").waitFor();
    await expect(page.locator(".fig svg")).toHaveAttribute(
      "aria-label",
      /бөмбөлөг/,
    );
    await page.locator("details.deeper summary").click();
    await expect(page.locator("details.deeper .katex-display")).toHaveCount(5);
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
