// <robot-3d model="planetary-rover" label="…">: a robot teardown's 3D model
// (the user, 2026-11-16: 3D on the dedicated pages). Everything <part-3d>
// does, plus the numbered labels of the teardown's parts, which follow the
// model as it turns. highlight(n) paints part n in its Sense · Think · Act
// colour (grey for parts with no role) while its row in the page's parts list
// is pointed at or focused, as the line drawing filled its number. The labels
// are decorative (aria-hidden): the parts list says the same in words.
import { Color, MeshLambertMaterial } from "three";
import { el } from "../kit";
import { ROBOT_MODELS } from "../../three/robots/planetary-rover";
import type { PartRecipe } from "../../three/kit";
import type { PartViewer } from "../../three/viewer";
import { Model3D } from "./part-3d";

class Robot3D extends Model3D {
  private labels = new Map<number, HTMLElement>();
  private hot: number | null = null;
  private paint = new MeshLambertMaterial();

  protected override recipe(name: string): PartRecipe | undefined {
    return ROBOT_MODELS[name];
  }

  protected override mounted(viewer: PartViewer, stage: HTMLElement): void {
    const layer = el("div", { class: "robot-labels", "aria-hidden": "true" });
    for (const c of viewer.parts.callouts ?? []) {
      const label = el("span", { class: "robot-label" }, String(c.n));
      this.labels.set(c.n, label);
      layer.append(label);
    }
    stage.append(layer);
    viewer.onDraw = () => {
      for (const c of viewer.parts.callouts ?? []) {
        const label = this.labels.get(c.n);
        if (!label) continue;
        const { x, y } = viewer.project(c.anchor);
        label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
      }
    };
    viewer.request();
    // Re-colour the highlighted part when the theme changes.
    new MutationObserver(() => this.highlight(this.hot)).observe(
      document.documentElement,
      { attributes: true, attributeFilter: ["data-theme"] },
    );
  }

  /** Lights part n (or none) in its role's colour. */
  highlight(n: number | null): void {
    const viewer = this.viewer;
    if (!viewer) return;
    const callouts = viewer.parts.callouts ?? [];
    for (const c of callouts) {
      viewer.paint(c.parts, undefined);
      this.labels.get(c.n)?.classList.remove("hot");
    }
    this.hot = n;
    const c = callouts.find((x) => x.n === n);
    if (!c) return;
    const role = this.getAttribute(`data-role-${c.n}`) ?? "none";
    this.paint.color = this.roleColour(role);
    viewer.paint(c.parts, this.paint);
    this.labels.get(c.n)?.classList.add("hot");
  }

  /** The theme's colour for a role (read from a .sense/.think/.act probe). */
  private roleColour(role: string): Color {
    const probe = el("span", { class: role, hidden: "" });
    this.append(probe);
    const css = getComputedStyle(probe);
    const value =
      role === "none"
        ? css.getPropertyValue("--muted")
        : css.getPropertyValue("--d") || css.getPropertyValue("--c");
    probe.remove();
    return new Color(value.trim() || "#888888");
  }
}

if (!customElements.get("robot-3d")) customElements.define("robot-3d", Robot3D);
