// Which topics the learner has marked as learned, kept in this browser only
// (localStorage, as in Sand to Tetris; no accounts). Roadmap checkboxes and
// the node page's "Mark as learned" button share it, and stay in sync across
// open tabs through the storage event.

const KEY = "dof-learned";

export function learned(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return new Set(
      Array.isArray(list)
        ? list.filter((x): x is string => typeof x === "string")
        : [],
    );
  } catch {
    return new Set();
  }
}

export function setLearned(id: string, on: boolean): void {
  const all = learned();
  if (on) all.add(id);
  else all.delete(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...all].sort()));
  } catch {
    // Storage blocked: the tick lasts for this page only.
  }
  window.dispatchEvent(new CustomEvent("dof-learned"));
}

/** Calls `fn` now and whenever progress changes (here or in another tab). */
export function onLearnedChange(fn: (all: Set<string>) => void): void {
  fn(learned());
  window.addEventListener("dof-learned", () => fn(learned()));
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) fn(learned());
  });
}
