import { expect, test } from "@playwright/test";

test.describe("tech tree", () => {
  test("shows all 71 topics in seven bands, T0 at the bottom", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("en/tree/");
    await expect(page.locator(".graph-view")).toBeVisible();
    await expect(page.locator("a.node")).toHaveCount(71);
    const bands = page.locator(".band");
    await expect(bands).toHaveCount(7);
    await expect(bands.first()).toContainText("T6");
    await expect(bands.last()).toContainText("T0");
  });

  test("selecting a topic opens the panel and marks its needs and unlocks", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("en/tree/");
    const panel = page.getByRole("complementary", { name: "Selected topic" });
    await expect(panel).toContainText("Select a topic");

    await page.locator('a.node[data-id="M5"]').click();
    await expect(page).toHaveURL(/\/en\/tree\/\?topic=M5$/);
    await expect(page.locator('a.node[data-id="M5"]')).toHaveClass(/\bon\b/);
    await expect(page.locator('a.node[data-id="L4"]')).toHaveClass(/\bneed\b/);
    await expect(page.locator('a.node[data-id="M6"]')).toHaveClass(
      /\bunlock\b/,
    );
    await expect(page.locator('a.node[data-id="F0"]')).toHaveClass(/^node t0$/);
    await expect(panel.locator("h2")).toHaveText("Classical control");
    await expect(panel.locator(".needs")).toContainText("L4 Motor control");
    await expect(panel.locator(".unlocks")).toContainText("M6 Modern control");
    await expect(panel.locator(".unlocks")).toContainText(
      "M11 Flight and vehicle control",
    );
    await expect(panel.locator("summary")).toContainText(
      "Everything it builds on (",
    );

    // Walk the tree from inside the panel.
    await panel.getByRole("button", { name: "L4 Motor control" }).click();
    await expect(panel.locator("h2")).toHaveText("Motor control");
    await expect(page).toHaveURL(/\?topic=L4$/);
    await expect(panel.locator("h2")).toBeFocused();

    await panel.getByRole("link", { name: "Open the page" }).click();
    await expect(page).toHaveURL(/\/en\/node\/motor-control\/$/);
  });

  test("a link with ?topic= opens with that topic selected; Escape clears it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto("mn/tree/?topic=P2");
    const panel = page.getByRole("complementary", { name: "Сонгосон сэдэв" });
    await expect(panel).toBeVisible(); // a bottom sheet below 1100px
    await expect(panel.locator("h2")).toHaveText("Калманы шүүлтүүр");
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(page).toHaveURL(/\/mn\/tree\/$/);
  });
  test("the list is the default on phones, and the choice is remembered", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("mn/tree/");
    await expect(page.locator(".list-view")).toBeVisible();
    await expect(page.locator(".graph-view")).toBeHidden();
    await expect(page.locator(".node-list li")).toHaveCount(71);
    await page.getByRole("button", { name: "Граф" }).click();
    await expect(page.locator(".graph-view")).toBeVisible();
    await expect(page.getByRole("button", { name: "Граф" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.reload();
    await expect(page.locator(".graph-view")).toBeVisible();
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
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto("en/");
  await expect(page.getByRole("navigation", { name: "Site" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
});
