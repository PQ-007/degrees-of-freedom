// Draws a MuJoCo model in 3D with Three.js: one shape per geom, placed from
// the engine's geom positions and orientations every frame. The look follows
// the site: flat shading, ink outlines, the theme's colours, and colour only
// on the geoms a demo marks as "accent" (its data colour).
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  EdgesGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
  type Material,
} from "three";
import type { Mujoco } from "./runner";
import type { MjData, MjModel } from "@mujoco/mujoco";

export type GeomRole = "body" | "accent" | "floor" | "muted";

export interface CameraSpec {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

interface Palette {
  bg: Color;
  surface: Color;
  line: Color;
  muted: Color;
  rule: Color;
  accent: Color;
}

function readPalette(el: Element): Palette {
  const css = getComputedStyle(el);
  const get = (name: string, fallback: string) =>
    new Color(css.getPropertyValue(name).trim() || fallback);
  return {
    bg: get("--bg", "#f4f3ee"),
    surface: get("--surface", "#ffffff"),
    line: get("--line", "#0b0b10"),
    muted: get("--muted", "#55555f"),
    rule: get("--rule", "#d9d8d2"),
    accent: get("--d", "#0b0b10"),
  };
}

const PLANE = 0;
const SPHERE = 2;
const CAPSULE = 3;
const CYLINDER = 5;
const BOX = 6;

export class Scene3D {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly meshes: { mesh: Mesh; index: number; role: GeomRole }[] = [];
  private readonly edges: LineBasicMaterial;
  private grid: LineSegments | undefined;
  private readonly gridMaterial = new LineBasicMaterial();
  private readonly host: Element;
  private readonly m = new Matrix4();

  constructor(
    canvas: HTMLCanvasElement,
    /** The element whose CSS colours the scene uses (the canvas isn't on the page yet). */
    host: Element,
    mj: Mujoco,
    model: MjModel,
    roles: Record<string, GeomRole>,
    camera: CameraSpec,
  ) {
    this.host = host;
    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera = new PerspectiveCamera(camera.fov, 16 / 9, 0.05, 50);
    this.camera.up.set(0, 0, 1); // MuJoCo's z is up
    this.camera.position.set(...camera.position);
    this.camera.lookAt(new Vector3(...camera.target));
    this.scene.add(new AmbientLight(0xffffff, 1.6));
    const sun = new DirectionalLight(0xffffff, 1.4);
    sun.position.set(2, -3, 5);
    this.scene.add(sun);
    this.edges = new LineBasicMaterial();

    const types = model.geom_type as Int32Array;
    const sizes = model.geom_size as Float64Array;
    for (let i = 0; i < model.ngeom; i++) {
      const s = [
        sizes[i * 3] ?? 0,
        sizes[i * 3 + 1] ?? 0,
        sizes[i * 3 + 2] ?? 0,
      ];
      const name = mj.mj_id2name(model, mj.mjtObj.mjOBJ_GEOM.value, i) ?? "";
      const role = roles[name] ?? "body";
      const geometry = shape(types[i] ?? -1, s);
      if (!geometry) continue;
      const mesh = new Mesh(geometry, new MeshLambertMaterial());
      mesh.matrixAutoUpdate = false;
      if (role !== "floor") {
        const curved = types[i] === SPHERE || types[i] === CAPSULE;
        mesh.add(
          new LineSegments(
            new EdgesGeometry(geometry, curved ? 89 : 20),
            this.edges,
          ),
        );
      } else {
        // The floor gets the drafting grid instead of an outline.
        this.grid = floorGrid(s[0] ?? 1, s[1] ?? 1, this.gridMaterial);
        mesh.add(this.grid);
      }
      this.scene.add(mesh);
      this.meshes.push({ mesh, index: i, role });
    }
    this.applyTheme();
  }

  /** Re-reads the theme's colours (call when light/dark changes). */
  applyTheme(): void {
    const p = readPalette(this.host);
    this.renderer.setClearColor(p.surface);
    this.edges.color = p.line;
    for (const { mesh, role } of this.meshes) {
      const material = mesh.material as MeshLambertMaterial;
      material.color =
        role === "accent"
          ? p.accent
          : role === "floor"
            ? p.bg
            : role === "muted"
              ? p.rule
              : p.surface;
    }
    this.gridMaterial.color = p.rule;
  }

  /** Places every geom where the engine says it is. */
  update(data: MjData): void {
    const pos = data.geom_xpos as Float64Array;
    const mat = data.geom_xmat as Float64Array;
    for (const { mesh, index: i } of this.meshes) {
      const r = (k: number) => mat[i * 9 + k] ?? 0;
      // MuJoCo's rotation matrix is row-major, as Matrix4.set expects.
      // prettier-ignore
      this.m.set(
        r(0), r(1), r(2), pos[i * 3] ?? 0,
        r(3), r(4), r(5), pos[i * 3 + 1] ?? 0,
        r(6), r(7), r(8), pos[i * 3 + 2] ?? 0,
        0, 0, 0, 1,
      );
      mesh.matrix.copy(this.m);
    }
  }

  render(): void {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const ratio = this.renderer.getPixelRatio();
    const resized =
      canvas.width !== Math.round(w * ratio) ||
      canvas.height !== Math.round(h * ratio);
    if (w > 0 && h > 0 && resized) {
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    for (const { mesh } of this.meshes) {
      mesh.geometry.dispose();
      (mesh.material as Material).dispose();
      for (const child of mesh.children) {
        if (child instanceof LineSegments)
          (child.geometry as BufferGeometry).dispose();
      }
    }
    this.edges.dispose();
    this.grid?.geometry.dispose();
    this.gridMaterial.dispose();
    this.renderer.dispose();
  }
}

/** Lines every 0.2 m across a floor of half-sizes a × b, just above it. */
function floorGrid(a: number, b: number, material: LineBasicMaterial) {
  const points: number[] = [];
  const step = 0.2;
  for (let x = -a; x <= a + 1e-9; x += step)
    points.push(x, -b, 0.001, x, b, 0.001);
  for (let y = -b; y <= b + 1e-9; y += step)
    points.push(-a, y, 0.001, a, y, 0.001);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return new LineSegments(geometry, material);
}

/** A Three.js shape for a MuJoCo geom; MuJoCo's capsules and cylinders run along z. */
function shape(type: number, s: number[]): BufferGeometry | undefined {
  const [a = 0, b = 0, c = 0] = s;
  switch (type) {
    case PLANE:
      return new PlaneGeometry(a * 2, b * 2);
    case SPHERE:
      return new SphereGeometry(a, 20, 14);
    case CAPSULE:
      return new CapsuleGeometry(a, b * 2, 6, 16).rotateX(Math.PI / 2);
    case CYLINDER:
      return new CylinderGeometry(a, a, b * 2, 20).rotateX(Math.PI / 2);
    case BOX:
      return new BoxGeometry(a * 2, b * 2, c * 2);
    default:
      return undefined;
  }
}
