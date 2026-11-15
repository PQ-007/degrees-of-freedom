// Shows one part's 3D model (src/three/parts) on a canvas: drag to turn it,
// buttons to turn it from the keyboard, its moving part moving unless paused.
// Colours come from the page's CSS, re-read when the theme changes, so the
// model looks like the site's line drawings in either theme.
import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  LineBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  Sphere,
  Spherical,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Materials, PartModel, PartRecipe } from "./kit";

function readColours(el: Element) {
  const css = getComputedStyle(el);
  const get = (name: string, fallback: string) =>
    new Color(css.getPropertyValue(name).trim() || fallback);
  return {
    surface: get("--surface", "#ffffff"),
    bg: get("--bg", "#f4f3ee"),
    line: get("--line", "#0b0b10"),
    rule: get("--rule", "#d9d8d2"),
    accent: get("--d", "#0b0b10"),
  };
}

export class PartViewer {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(32, 4 / 3, 0.1, 100);
  private readonly controls: OrbitControls;
  private readonly materials: Materials = {
    body: new MeshLambertMaterial(),
    dark: new MeshLambertMaterial(),
    accent: new MeshLambertMaterial(),
    pale: new MeshLambertMaterial(),
    edges: new LineBasicMaterial(),
  };
  private readonly model: PartModel;
  private readonly home = new Vector3();
  private frame = 0;
  private t = 0;
  private last = 0;
  playing = false;

  constructor(
    canvas: HTMLCanvasElement,
    private readonly host: Element,
    recipe: PartRecipe,
  ) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.scene.add(new AmbientLight(0xffffff, 1.5));
    const key = new DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 5, 4);
    const fill = new DirectionalLight(0xffffff, 0.5);
    fill.position.set(-4, 1, -2);
    this.scene.add(key, fill);

    this.model = recipe(this.materials);
    this.model.pose(0);
    this.scene.add(this.model.root);

    // Frame the model: look at its centre from the front, a little above and
    // to the right, far enough back for all of it to fit.
    const sphere = new Box3()
      .setFromObject(this.model.root)
      .getBoundingSphere(new Sphere());
    const distance =
      sphere.radius / Math.sin((this.camera.fov * Math.PI) / 360);
    this.home
      .set(...(this.model.view ?? [0.55, 0.42, 1]))
      .normalize()
      .multiplyScalar(distance * 0.82)
      .add(sphere.center);
    this.camera.position.copy(this.home);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.copy(sphere.center);
    this.controls.enableZoom = false; // the wheel scrolls the page
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.addEventListener("change", () => this.request());
    this.controls.update();
    this.applyTheme();
  }

  /** Re-reads the theme's colours. */
  applyTheme(): void {
    const c = readColours(this.host);
    this.renderer.setClearColor(c.surface);
    (this.materials.body as MeshLambertMaterial).color = c.surface;
    (this.materials.dark as MeshLambertMaterial).color = c.rule;
    (this.materials.pale as MeshLambertMaterial).color = c.bg;
    (this.materials.accent as MeshLambertMaterial).color = c.accent;
    this.materials.edges.color = c.line;
    this.request();
  }

  /** Turns the view about the vertical axis by `angle` radians. */
  turn(angle: number): void {
    const offset = this.camera.position.clone().sub(this.controls.target);
    const s = new Spherical().setFromVector3(offset);
    s.theta += angle;
    this.camera.position
      .copy(new Vector3().setFromSpherical(s))
      .add(this.controls.target);
    this.controls.update();
    this.request();
  }

  /** Back to the starting view. */
  reset(): void {
    this.camera.position.copy(this.home);
    this.controls.update();
    this.request();
  }

  play(on: boolean): void {
    this.playing = on;
    this.last = performance.now();
    this.request();
  }

  private request(): void {
    if (this.frame === 0)
      this.frame = requestAnimationFrame((now) => this.draw(now));
  }

  private draw(now: number): void {
    this.frame = 0;
    if (this.playing) {
      this.t += Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      this.model.pose(this.t);
    }
    // Damping keeps the view drifting a moment after a drag.
    const moving = this.controls.update();
    this.resize();
    this.renderer.render(this.scene, this.camera);
    if (this.playing || moving) this.request();
  }

  private resize(): void {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const ratio = this.renderer.getPixelRatio();
    if (
      w > 0 &&
      h > 0 &&
      (canvas.width !== Math.round(w * ratio) ||
        canvas.height !== Math.round(h * ratio))
    ) {
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.controls.dispose();
    this.model.root.traverse((o) => {
      const g = (o as { geometry?: { dispose(): void } }).geometry;
      g?.dispose();
    });
    for (const mat of Object.values(this.materials)) mat.dispose();
    this.renderer.dispose();
  }
}
