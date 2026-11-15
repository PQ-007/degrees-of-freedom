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
  "induction-demo": () => import("./elements/induction-demo"),
  "pwm-demo": () => import("./elements/pwm-demo"),
  "adc-demo": () => import("./elements/adc-demo"),
  "reach-demo": () => import("./elements/reach-demo"),
  "gears-demo": () => import("./elements/gears-demo"),
  "drive-demo": () => import("./elements/drive-demo"),
  "part-3d": () => import("./elements/part-3d"),
};

export function upgradeDemos(root: ParentNode = document): void {
  for (const [tag, load] of Object.entries(DEMOS)) {
    const found = [...root.querySelectorAll<HTMLElement>(tag)];
    if (found.length === 0) continue;
    // If the code can't be fetched, the element shows its no-JS content.
    const run = () =>
      load().catch(() => {
        for (const el of found) el.dataset["mode"] ??= "drawing";
      });
    if (!("IntersectionObserver" in window)) {
      void run();
      continue;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void run();
        }
      },
      { rootMargin: "400px" },
    );
    for (const el of found) io.observe(el);
  }
}
