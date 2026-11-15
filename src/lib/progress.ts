// What the learner has ticked, kept in this browser only (localStorage, as in
// Sand to Tetris; no accounts): learned topics (roadmap checkboxes and the
// node page's "Learned" share it). Pages stay in sync with each other and
// across open tabs.

function store(key: string) {
  const event = `dof-change:${key}`;
  const read = (): Set<string> => {
    try {
      const raw = localStorage.getItem(key);
      const list: unknown = raw ? JSON.parse(raw) : [];
      return new Set(
        Array.isArray(list)
          ? list.filter((x): x is string => typeof x === "string")
          : [],
      );
    } catch {
      return new Set();
    }
  };
  return {
    read,
    set(id: string, on: boolean): void {
      const all = read();
      if (on) all.add(id);
      else all.delete(id);
      try {
        localStorage.setItem(key, JSON.stringify([...all].sort()));
      } catch {
        // Storage blocked: the tick lasts for this page only.
      }
      window.dispatchEvent(new CustomEvent(event));
    },
    /** Calls `fn` now and whenever the list changes (here or in another tab). */
    onChange(fn: (all: Set<string>) => void): void {
      fn(read());
      window.addEventListener(event, () => fn(read()));
      window.addEventListener("storage", (e) => {
        if (e.key === key) fn(read());
      });
    },
  };
}

const learnedStore = store("dof-learned");
export const learned = learnedStore.read;
export const setLearned = learnedStore.set;
export const onLearnedChange = learnedStore.onChange;
