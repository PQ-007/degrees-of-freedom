import { expect, test } from "@playwright/test";

test("the root sends English browsers to /en/", async ({ browser }) => {
  const page = await browser.newPage({ locale: "en-US" });
  await page.goto("./");
  await expect(page).toHaveURL(/\/degrees-of-freedom\/en\/$/);
  await page.close();
});

test("the root sends Mongolian browsers to /mn/", async ({ browser }) => {
  const page = await browser.newPage({ locale: "mn-MN" });
  await page.goto("./");
  await expect(page).toHaveURL(/\/degrees-of-freedom\/mn\/$/);
  await page.close();
});

test("the theme button switches the theme and remembers it", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("en/");
  const html = page.locator("html");
  const button = page.locator(".theme-toggle");

  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(button).toHaveText("Dark");
  await button.click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(button).toHaveText("Light");
  await expect(button).toHaveAttribute(
    "aria-label",
    "Switch to the light theme",
  );

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await page.goto("mn/");
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(button).toHaveText("Цагаан");
});

test("the language link goes to the same page in the other language", async ({
  page,
}) => {
  await page.goto("en/");
  await page.getByRole("link", { name: "Монгол", exact: true }).click();
  await expect(page).toHaveURL(/\/mn\/$/);
  await expect(page.locator("h1")).toHaveText("Degrees of Freedom");
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/$/);
});

test("the tier stack lists T0 to T6, T0 first at the top", async ({ page }) => {
  await page.goto("en/");
  const items = page.locator(".tiers li");
  await expect(items).toHaveCount(7);
  await expect(items.first()).toContainText("T0");
  const top0 = (await items.first().boundingBox())?.y ?? 0;
  const top6 = (await items.last().boundingBox())?.y ?? 0;
  expect(top0).toBeLessThan(top6);
});
