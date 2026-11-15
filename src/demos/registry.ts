// Every demo element the Markdown may use, and how to load it. Each loads only
// when its element comes near the screen. tests/unit/demos.test.ts checks
// that every custom element in the content is listed here.
export const DEMOS: Record<string, () => Promise<unknown>> = {
  "cartpole-demo": () => import("./elements/cartpole-demo"),
  "frames-demo": () => import("./elements/frames-demo"),
  "euler-demo": () => import("./elements/euler-demo"),
  "noise-demo": () => import("./elements/noise-demo"),
  "fit-demo": () => import("./elements/fit-demo"),
  "lever-demo": () => import("./elements/lever-demo"),
};

export function upgradeDemos(root: ParentNode = document): void {
  for (const [tag, load] of Object.entries(DEMOS)) {
    const found = [...root.querySelectorAll(tag)];
    if (found.length === 0) continue;
    if (!("IntersectionObserver" in window)) {
      void load();
      continue;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void load();
        }
      },
      { rootMargin: "400px" },
    );
    for (const el of found) io.observe(el);
  }
}
