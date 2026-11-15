// <part-3d model="gearmotor" label="…">: a part's 3D model on its Hardware
// page (the user, 2026-11-16: 3D models on the dedicated pages only; the
// cards keep their drawings). The element's own content is the line drawing:
// it stays when JavaScript or WebGL is missing. With WebGL, the drawing gives
// way to the model: drag to turn it, or use the buttons; the moving part
// moves until paused, and starts paused under reduced motion.
import { el, pageLang, translator } from "../kit";
import { hasWebGL } from "../../sim/load";
import { PART_MODELS } from "../../three/parts";
import { PartViewer } from "../../three/viewer";
import "../demo.css";

class Part3D extends HTMLElement {
  private viewer: PartViewer | undefined;
  private theme: MutationObserver | undefined;

  connectedCallback(): void {
    if (this.viewer) return;
    const recipe = PART_MODELS[this.getAttribute("model") ?? ""];
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

    const button = (label: string, onClick: () => void) => {
      const b = el("button", { type: "button", class: "btn small" }, label);
      b.addEventListener("click", onClick);
      return b;
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const play = button(tr("part3d.motion"), () => setPlaying(!viewer.playing));
    const setPlaying = (on: boolean) => {
      viewer.play(on);
      play.setAttribute("aria-pressed", String(on));
    };
    const step = Math.PI / 6;
    this.replaceChildren(
      canvas,
      el(
        "div",
        { class: "part-controls" },
        button(`← ${tr("part3d.left")}`, () => viewer.turn(-step)),
        button(`${tr("part3d.right")} →`, () => viewer.turn(step)),
        button(tr("part3d.reset"), () => viewer.reset()),
        play,
      ),
      el("p", { class: "part-hint muted" }, tr("part3d.hint")),
    );
    setPlaying(!reduced.matches);
    this.dataset["mode"] = "3d";
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

if (!customElements.get("part-3d")) customElements.define("part-3d", Part3D);
