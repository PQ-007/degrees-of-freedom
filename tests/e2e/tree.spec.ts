import { expect, test } from "@playwright/test";

test.describe("tech tree", () => {
  test("opens on T0, with the seven tiers in order from T0", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("en/tree/");
    const steps = page
      .getByRole("navigation", { name: "Tiers" })
      .getByRole("link");
    await expect(steps).toHaveCount(7);
    await expect(steps.first()).toContainText("T0");
    await expect(steps.last()).toContainText("T6");
    await expect(steps.first()).toHaveAttribute("aria-current", "step");
    await expect(page.locator("section#T0")).toBeVisible();
    await expect(page.locator("section#T0 .card")).toHaveCount(10);
    await expect(page.locator("section#T1")).toBeHidden();
    // Every topic is on the page, one tier showing at a time.
    await expect(page.locator(".card")).toHaveCount(71);
  });

  test("the rail and the next button move between tiers", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("en/tree/");
    await page.getByRole("link", { name: "T1 Components →" }).click();
    await expect(page).toHaveURL(/#T1$/);
    await expect(page.locator("section#T1")).toBeVisible();
    await expect(page.locator("section#T0")).toBeHidden();
    await expect(page.locator("section#T1 h2")).toBeFocused();

    await page
      .getByRole("navigation", { name: "Tiers" })
      .getByRole("link", { name: /T3/ })
      .click();
    await expect(page.locator("section#T3 .card")).toHaveCount(11);
    await page.goBack();
    await expect(page.locator("section#T1")).toBeVisible();
  });

  test("a card's needs and unlocks jump to that topic, in any tier", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("en/tree/#M5");
    const m5 = page.locator("li#M5");
    await expect(m5).toBeVisible();
    await expect(m5).toHaveClass(/flash/);
    await expect(m5.locator("dd").first()).toContainText("L4 Motor control");
    await expect(m5.locator("dd").last()).toContainText("M6 Modern control");

    await m5.getByRole("link", { name: "L4 Motor control" }).click();
    await expect(page).toHaveURL(/#L4$/);
    await expect(page.locator("section#T2")).toBeVisible();
    await expect(page.locator("li#L4")).toHaveClass(/flash/);
    await expect(page.locator("li#L4 h3 a")).toBeFocused();

    await page.locator("li#L4 h3 a").click();
    await expect(page).toHaveURL(/\/en\/node\/motor-control\/$/);
  });

  test("phones get a strip of tier tabs", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("mn/tree/#P2");
    await expect(page.locator("section#T4")).toBeVisible();
    await expect(page.locator("li#P2 h3")).toHaveText("Калманы шүүлтүүр");
    const steps = page
      .getByRole("navigation", { name: "Түвшнүүд" })
      .getByRole("link");
    await expect(steps.nth(4)).toHaveAttribute("aria-current", "step");
    await steps.nth(0).click();
    await expect(page.locator("section#T0")).toBeVisible();
  });

  test("a node page shows its needs and what uses it", async ({ page }) => {
    await page.goto("en/node/classical-control/");
    await expect(page.locator("h1")).toHaveText("Classical control");
    await expect(page.locator(".meta")).toContainText("L4 Motor control");
    await expect(page.locator(".meta")).toContainText("M6 Modern control");
    await page.getByRole("link", { name: "L4 Motor control" }).click();
    await expect(page).toHaveURL(/\/en\/node\/motor-control\/$/);
  });
});

test("every link on every page leads somewhere", async ({ request }) => {
  test.setTimeout(120_000);

  const start = [
    "en/",
    "mn/",
    "en/tree/",
    "mn/tree/",
    "en/search/",
    "mn/search/",
  ];
  const seen = new Set<string>();
  const queue = start.map(
    (p) => new URL(p, "http://localhost:4329/degrees-of-freedom/").href,
  );
  const broken: string[] = [];

  while (queue.length > 0) {
    const url = queue.shift() as string;
    if (seen.has(url)) continue;
    seen.add(url);
    const res = await request.get(url);
    if (res.status() !== 200) {
      broken.push(`${url} → ${res.status()}`);
      continue;
    }
    if (!(res.headers()["content-type"] ?? "").includes("text/html")) continue;
    const html = await res.text();
    for (const m of html.matchAll(/href="([^"#]+)"/g)) {
      const href = m[1] as string;
      if (
        /^(https?:|mailto:)/.test(href) &&
        !href.startsWith("http://localhost")
      )
        continue;
      const next = new URL(href, url);
      next.search = "";
      if (
        next.pathname.startsWith("/degrees-of-freedom/") &&
        !seen.has(next.href)
      )
        queue.push(next.href);
    }
  }
  expect(broken).toEqual([]);
  expect(seen.size).toBeGreaterThan(150);
});

test.describe("search", () => {
  test("finds a topic in English", async ({ page }) => {
    await page.goto("en/search/");
    await page.getByLabel("Search for").fill("kalman");
    const first = page.locator("[data-search-results] li a").first();
    await expect(first).toContainText("Kalman filters");
    await expect(page).toHaveURL(/\?q=kalman$/);
    await first.click();
    await expect(page).toHaveURL(/\/en\/node\/kalman-filters\/$/);
  });

  test("finds a topic in Mongolian, in the Mongolian index", async ({
    page,
  }) => {
    await page.goto("mn/search/?q=Калманы");
    const first = page.locator("[data-search-results] li a").first();
    await expect(first).toContainText("Калманы шүүлтүүр");
    await expect(first).toHaveAttribute(
      "href",
      /\/mn\/node\/kalman-filters\/$/,
    );
  });

  test("says when nothing matches", async ({ page }) => {
    await page.goto("en/search/?q=zzzqqq");
    await expect(page.locator("[data-search-status]")).toHaveText(
      "Nothing found for “zzzqqq”.",
    );
  });
});

test.describe("header on phones", () => {
  test("the menu opens the nav and the language link", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("en/");
    const nav = page.getByRole("navigation", { name: "Site" });
    await expect(nav).toBeHidden();
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(nav).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Монгол", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
    await expect(menu).toBeFocused();
  });
});

test("wide screens show the nav and no menu button", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("en/");
  await expect(page.getByRole("navigation", { name: "Site" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
});
