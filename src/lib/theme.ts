// Light/dark theme. The choice is kept in localStorage under STORAGE_KEY; with no
// stored choice the system preference decides. The same logic runs inline in
// <head> (Base.astro) before first paint, so the page never flashes.

export type Theme = "light" | "dark";
export const STORAGE_KEY = "dof-theme";

export function currentTheme(): Theme {
  return document.documentElement.dataset["theme"] === "dark"
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset["theme"] = theme;
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode); the choice then lasts for this page only.
  }
}
