// <part-3d model="gearmotor" label="…">: a part's 3D model on its Hardware
// page (the user, 2026-11-16: 3D models on the dedicated pages only; the
// cards keep their drawings). The element's own content is the line drawing:
// it stays when JavaScript or WebGL is missing. With WebGL, the drawing gives
// way to the model: drag it to turn it, or focus it and use the arrow keys
// (Home: front view); the moving part moves until paused with the Motion
// button, and starts paused under reduced motion.
//
// Model3D is shared with <robot-3d> (robot-3d.ts), which adds numbered
// labels to a robot's parts.
import { el, pageLang, translator } from "../kit";
import { hasWebGL } from "../../sim/load";
import { PART_MODELS } from "../../three/parts";
import type { PartRecipe } from "../../three/kit";
import { PartViewer } from "../../three/viewer";
import "../demo.css";

export class Model3D extends HTMLElement {
  protected viewer: PartViewer | undefined;
  private theme: MutationObserver | undefined;

  /** The recipe for this element's model attribute. */
  protected recipe(name: string): PartRecipe | undefined {
    return PART_MODELS[name];
  }

  /** Called once the model is showing; `stage` holds the canvas. A part has
   * nothing to add; <robot-3d> adds its labels here. */
  protected mounted(viewer: PartViewer, stage: HTMLElement): void {
    void viewer;
    void stage;
  }

  connectedCallback(): void {
    if (this.viewer) return;
    const recipe = this.recipe(this.getAttribute("model") ?? "");
    if (!recipe || !hasWebGL()) {
      this.dataset["mode"] = "drawing";
      return;
    }
    const tr = translator(pageLang(this));
    const canvas = el("canvas", {
      class: "part-canvas",
      role: "img",
      "aria-label": this.getAttribute("label") ?? "",
    });
    let viewer: PartViewer;
    try {
      viewer = new PartViewer(canvas, this, recipe);
    } catch {
      this.dataset["mode"] = "drawing"; // WebGL failed after all
      return;
    }
    this.viewer = viewer;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const play = el(
      "button",
      { type: "button", class: "btn small" },
      tr("part3d.motion"),
    );
    const setPlaying = (on: boolean) => {
      viewer.play(on);
      play.setAttribute("aria-pressed", String(on));
    };
    play.addEventListener("click", () => setPlaying(!viewer.playing));
    // No turn buttons (the user, 2026-11-16): the model takes keyboard
    // focus instead, so it still turns without a mouse. Arrow keys turn it,
    // Home brings back the front view.
    const step = Math.PI / 12;
    canvas.tabIndex = 0;
    canvas.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") viewer.turn(-step);
      else if (e.key === "ArrowRight") viewer.turn(step);
      else if (e.key === "Home") viewer.reset();
      else return;
      e.preventDefault();
    });
    const stage = el("div", { class: "part-stage" }, canvas);
    this.replaceChildren(
      stage,
      el(
        "div",
        { class: "part-controls" },
        play,
        el("p", { class: "part-hint muted" }, tr("part3d.hint")),
      ),
    );
    setPlaying(!reduced.matches);
    this.dataset["mode"] = "3d";
    this.mounted(viewer, stage);
    this.theme = new MutationObserver(() => viewer.applyTheme());
    this.theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  disconnectedCallback(): void {
    this.theme?.disconnect();
    this.viewer?.dispose();
    this.viewer = undefined;
  }
}

if (!customElements.get("part-3d")) customElements.define("part-3d", Model3D);
