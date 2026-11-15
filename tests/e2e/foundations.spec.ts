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

test.describe("F5 Mechanics", () => {
  test("the motor holds a light load, not a heavy one, and nothing straight up", async ({
    page,
  }) => {
    await page.goto("en/node/mechanics/#try");
    const demo = page.locator("lever-demo");
    const out = demo.locator(".sim-readouts");
    await expect(out).toContainText("Torque needed0.98 N·m");
    await expect(out).toContainText("Holds it");
    await demo.getByLabel("Mass").fill("1");
    await expect(out).toContainText("Too heavy: the arm sags");
    await demo.getByLabel("Angle above level").fill("90");
    await expect(out).toContainText("Torque needed0.00 N·m");
    await expect(out).toContainText("Any weight (straight up)");
  });

  test("the free-body figure is described, and the page passes axe on a phone", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("mn/node/mechanics/#try");
    await page.locator("lever-demo .demo-plot").waitFor();
    await expect(page.locator(".fig svg")).toHaveAttribute(
      "aria-label",
      /блок/,
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

test.describe("F6 Electromagnetism", () => {
  test("the coil's voltage: none when still, double with double the turns", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      ...(baseURL ? { baseURL } : {}),
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto("en/node/electromagnetism/#try");
    const demo = page.locator("induction-demo");
    const out = demo.locator(".sim-readouts");
    // Reduced motion: it starts paused, and a still magnet makes no voltage.
    await expect(demo.getByRole("button", { name: "Play" })).toBeVisible();
    await expect(out).toContainText("MagnetStill");
    await expect(out).toContainText("Voltage now0.000 V");
    await expect(out).toContainText("Largest voltage0.112 V");
    await demo.getByLabel("Turns of wire").fill("400");
    await expect(out).toContainText("Largest voltage0.223 V");
    await demo.getByRole("button", { name: "Play" }).click();
    await expect(demo.getByRole("button", { name: "Pause" })).toBeVisible();
    await expect(out).toContainText(/Moving (in|out)/);
    await context.close();
  });

  test("the motor figure is described, and the page passes axe on a phone", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("mn/node/electromagnetism/#try");
    await page.locator("induction-demo .demo-plot").first().waitFor();
    await expect(page.locator(".fig svg")).toHaveAttribute(
      "aria-label",
      /гогцоо/,
    );
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

test.describe("F7 Electronics basics", () => {
  test("the duty cycle sets the average; faster switching smooths the speed", async ({
    page,
  }) => {
    await page.goto("en/node/electronics-basics/#try");
    const demo = page.locator("pwm-demo");
    const out = demo.locator(".sim-readouts");
    await expect(out).toContainText("Average voltage6.0 V");
    await demo.getByLabel("Duty cycle").fill("25");
    await expect(out).toContainText("Average voltage3.0 V");
    await expect(out).toContainText("Motor speed25%");
    await demo.getByLabel("Switching frequency").fill("0");
    const slow = parseFloat(
      (await out.locator("dd").nth(2).textContent()) ?? "0",
    );
    await demo.getByLabel("Switching frequency").fill("7");
    const fast = parseFloat(
      (await out.locator("dd").nth(2).textContent()) ?? "0",
    );
    expect(slow).toBeGreaterThan(50);
    expect(fast).toBeLessThan(1);
  });

  test("the schematic is described, and the page passes axe on a phone", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("mn/node/electronics-basics/#try");
    await page.locator("pwm-demo .demo-plot").waitFor();
    await expect(page.locator(".fig svg")).toHaveAttribute(
      "aria-label",
      /батарей/,
    );
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

test.describe("F8 Programming for robots", () => {
  test("the code is plain, one colour, and scrolls from the keyboard", async ({
    page,
  }) => {
    await page.goto("en/node/programming-for-robots/");
    const code = page.locator(".prose pre.code");
    await expect(code).toHaveCount(4);
    for (const pre of await code.all())
      await expect(pre).toHaveAttribute("tabindex", "0");
    // No syntax highlighting: colour is for tiers and data only.
    await expect(page.locator(".astro-code, pre [style*='color']")).toHaveCount(
      0,
    );
    await expect(code.first()).toContainText("void loop()");
  });

  test("the map is described, and the page passes axe on a phone", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("mn/node/programming-for-robots/");
    await expect(page.locator(".fig svg")).toHaveAttribute(
      "aria-label",
      /микроконтроллер|чип/,
    );
    await expect(page.locator(".prose pre.code").first()).toContainText(
      "мэдрэх",
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
});

test.describe("F9 How computers work", () => {
  test("each extra bit doubles the readings; the marker shows one in binary", async ({
    page,
  }) => {
    await page.goto("en/node/how-computers-work/#try");
    const demo = page.locator("adc-demo");
    const out = demo.locator(".sim-readouts");
    await expect(out).toContainText("Possible readings8 (0–7)");
    await expect(out.locator("dd").nth(3)).toHaveText(/^[01]{3}$/);
    await demo.getByLabel("Bits").fill("10");
    await expect(out).toContainText("Possible readings1,024 (0–1,023)");
    await expect(out).toContainText("Step size4.88 mV");
    await expect(out.locator("dd").nth(3)).toHaveText(/^[01]{10}$/);
  });

  test("the blocks are described, and the page passes axe on a phone", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("mn/node/how-computers-work/#try");
    await page.locator("adc-demo .demo-plot").waitFor();
    await expect(page.locator(".fig svg")).toHaveAttribute(
      "aria-label",
      /тасалдал/,
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
