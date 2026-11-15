import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const page = "en/node/classical-control/#try";
const time = async (p: Page) =>
  Number(
    (
      await p.locator(".sim-readouts div").nth(2).locator("dd").textContent()
    )?.replace(/[^\d.]/g, ""),
  );
const ready = (p: Page) =>
  expect(p.locator("mujoco-scene")).toHaveAttribute(
    "data-mode",
    /^(3d|flat|replay)$/,
    { timeout: 30_000 },
  );

test.describe("cart-pole demo", () => {
  test("shows a drawing and a Run button, and loads nothing heavy until asked", async ({
    page: p,
  }) => {
    const wasm: string[] = [];
    p.on("request", (r) => {
      if (/\.wasm$|scene3d/.test(r.url())) wasm.push(r.url());
    });
    await p.goto(page);
    await expect(p.locator(".sim-flat")).toHaveAttribute("role", "img");
    await expect(
      p.getByRole("button", { name: "Run simulation" }),
    ).toBeVisible();
    await expect(
      p.getByRole("button", { name: "Push the pole →" }),
    ).toBeDisabled();
    await p.waitForTimeout(500);
    expect(wasm).toEqual([]);
  });

  test("Run starts MuJoCo; Pause, Step and Reset control time", async ({
    page: p,
  }) => {
    await p.goto(page);
    await p.getByRole("button", { name: "Run simulation" }).click();
    await ready(p);
    await expect(p.locator("mujoco-scene")).toHaveAttribute(
      "data-mode",
      /^(3d|flat)$/,
    );
    await expect(p.locator(".sim-readouts")).toContainText("Upright");
    await expect.poll(() => time(p)).toBeGreaterThan(0.5);
    await p.getByRole("button", { name: "Pause" }).click();
    const paused = await time(p);
    await p.waitForTimeout(300);
    expect(await time(p)).toBe(paused);
    await p.getByRole("button", { name: "Step" }).click();
    await expect.poll(() => time(p)).toBeGreaterThan(paused);
    await p.getByRole("button", { name: "Reset" }).click();
    await expect.poll(() => time(p)).toBe(0);
    // The running demo passes axe too.
    const axe = await new AxeBuilder({ page: p })
      .include(".sim-demo")
      .analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
  });

  test("a preset sets the gains, and Only P lets the pole fall", async ({
    page: p,
  }) => {
    await p.goto(page);
    await p.getByRole("button", { name: "Run simulation" }).click();
    await ready(p);
    const onlyP = p.getByRole("button", { name: "Only P: falls" });
    await onlyP.click();
    await expect(onlyP).toHaveAttribute("aria-pressed", "true");
    await expect(p.getByLabel("D (derivative)")).toHaveValue("0");
    await expect(p.locator(".sim-readouts")).toContainText(
      "Fallen: press Reset",
      { timeout: 10_000 },
    );
    // Moving a slider leaves the preset.
    await p.getByLabel("D (derivative)").fill("6");
    await expect(onlyP).toHaveAttribute("aria-pressed", "false");
  });

  test("without WebAssembly it plays the recording and says so", async ({
    page: p,
  }) => {
    await p.addInitScript(() => {
      // @ts-expect-error: removing it on purpose
      delete window.WebAssembly;
    });
    await p.goto(page);
    await p.getByRole("button", { name: "Run simulation" }).click();
    await expect(p.locator("mujoco-scene")).toHaveAttribute(
      "data-mode",
      "replay",
    );
    await expect(p.locator(".sim-note")).toContainText("A recording");
    await expect(p.locator(".sim-flat")).toBeVisible();
    await expect(
      p.getByRole("button", { name: "Push the pole →" }),
    ).toBeDisabled();
    await expect(p.getByLabel("P (proportional)")).toBeDisabled();
    await expect.poll(() => time(p)).toBeGreaterThan(0.3);
  });

  test("with reduced motion it loads paused", async ({ page: p }) => {
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.goto(page);
    await p.getByRole("button", { name: "Run simulation" }).click();
    await ready(p);
    await expect(p.getByRole("button", { name: "Play" })).toBeEnabled();
    expect(await time(p)).toBe(0);
  });

  test("speaks Mongolian on the Mongolian page", async ({ page: p }) => {
    await p.goto("mn/node/classical-control/#try");
    await expect(
      p.getByRole("button", { name: "Симуляцыг ажиллуулах" }),
    ).toBeVisible();
    await expect(p.getByLabel("P (пропорционал)")).toBeVisible();
  });
});

test("the home page's Simulations row leads to the cart-pole", async ({
  page: p,
}) => {
  for (const [lang, name] of [
    ["en", "Balance a pole"],
    ["mn", "Саваа тэнцвэржүүлэх"],
  ] as const) {
    await p.goto(`${lang}/`);
    const row = p.locator("#simulations");
    await expect(row.locator("svg")).toHaveCount(1);
    await row.getByRole("link", { name: new RegExp(name) }).click();
    await expect(p).toHaveURL(
      new RegExp(`${lang}/node/classical-control/#try$`),
    );
    await expect(p.locator("mujoco-scene")).toBeVisible();
  }
});
