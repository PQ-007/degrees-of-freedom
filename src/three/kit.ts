// Building blocks for the parts' 3D models (the user, 2026-11-16: "use more
// detailed figures, 3d models", shown on each part's own page). No DOM: the
// models are plain Three.js objects, so unit tests can build them in Node.
//
// The look follows the site's line drawings: light faces, ink outlines on
// every edge, darker grey for metal and rubber, and colour only on the part
// that moves (its row's Sense · Think · Act colour). Every mesh is tagged with
// a role; the viewer colours the roles from the theme.
import {
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  LineSegments,
  Mesh,
  Shape,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  type BufferGeometry,
  type LineBasicMaterial,
  type Material,
  type Object3D,
} from "three";
import { gearOutline } from "../demos/models/gears";

/** What a surface is, which sets its colour: the theme's surface, a darker
 * grey (metal, rubber, plastic housings), the accent, or a pale line colour. */
export type Role = "body" | "dark" | "accent" | "pale";

export interface Materials {
  body: Material;
  dark: Material;
  accent: Material;
  pale: Material;
  edges: LineBasicMaterial;
}

/** A model: its root, and how its moving part moves at time t (s). */
export interface PartModel {
  root: Group;
  /** Moves the moving part to where it is t seconds into the motion. */
  pose: (t: number) => void;
  /** Where the camera starts, as a direction from the model's centre
   * (default: in front, a little above and to the right). */
  view?: [number, number, number];
}

/** A model's recipe: builds it from the shared materials. */
export type PartRecipe = (m: Materials) => PartModel;

/** A mesh in its role's material, with its edges inked in. Curved surfaces
 * keep only their sharp edges (angle threshold), so a cylinder shows its rims
 * and not every facet. */
export function part(
  geometry: BufferGeometry,
  role: Role,
  m: Materials,
  threshold = 35,
): Mesh {
  const mesh = new Mesh(geometry, m[role]);
  mesh.userData["role"] = role;
  mesh.add(new LineSegments(new EdgesGeometry(geometry, threshold), m.edges));
  return mesh;
}

/** Puts an object at (x, y, z), turned by (rx, ry, rz) radians. */
export function at<T extends Object3D>(
  o: T,
  x: number,
  y: number,
  z: number,
  rx = 0,
  ry = 0,
  rz = 0,
): T {
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, rz);
  return o;
}

/** A group of objects. */
export function group(...children: Object3D[]): Group {
  const g = new Group();
  g.add(...children);
  return g;
}

export const box = (w: number, h: number, d: number) =>
  new BoxGeometry(w, h, d);

/** A cylinder along y. */
export const cyl = (r: number, h: number, segments = 40) =>
  new CylinderGeometry(r, r, h, segments);

/** A cone or a tapered cylinder along y. */
export const taper = (rTop: number, rBottom: number, h: number) =>
  new CylinderGeometry(rTop, rBottom, h, 40);

export const ball = (r: number) => new SphereGeometry(r, 32, 20);

/** A ring in the xy plane (as a torus): radius r, tube thickness t. */
export const ring = (r: number, t: number) => new TorusGeometry(r, t, 12, 48);

/** A spur gear: z teeth on pitch radius r, thickness h (the tooth shape is
 * the C2 demo's), its axis along z (facing you) or y. The first tooth points
 * along +x. */
export function gear(
  z: number,
  r: number,
  h: number,
  axis: "y" | "z" = "z",
): BufferGeometry {
  const shape = outline(gearOutline(z, r));
  const g = new ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
  g.translate(0, 0, -h / 2);
  if (axis === "y") g.rotateX(-Math.PI / 2);
  return g;
}

/** A ring with teeth on its inside (an internal gear), axis along z: z teeth
 * on pitch radius r, outer radius R, thickness h. */
export function ringGear(
  z: number,
  r: number,
  R: number,
  h: number,
): BufferGeometry {
  const shape = new Shape();
  const n = 96;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    if (i === 0) shape.moveTo(R * Math.cos(a), R * Math.sin(a));
    else shape.lineTo(R * Math.cos(a), R * Math.sin(a));
  }
  // The hole is a gear's outline turned inside out: its gaps are the ring's
  // teeth (half a tooth turned, so a tooth points in along +x).
  shape.holes.push(outline(gearOutline(z, r, Math.PI / z)));
  const g = new ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
  g.translate(0, 0, -h / 2);
  return g;
}

function outline(pts: [number, number][]): Shape {
  const shape = new Shape();
  pts.forEach(([x, y], i) =>
    i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y),
  );
  shape.closePath();
  return shape;
}

/** A round shaft with a flat (a D-shaft), axis along z, radius r, length l. */
export function dShaft(r: number, l: number): BufferGeometry {
  const pts: [number, number][] = [];
  const flat = Math.acos(0.7);
  for (let i = 0; i <= 40; i++) {
    const a = flat + (i / 40) * (Math.PI * 2 - 2 * flat);
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return plate(pts, l);
}

/** A flat outline (points in x, y) extruded along z by depth, centred. */
export function plate(
  points: [number, number][],
  depth: number,
): BufferGeometry {
  const shape = new Shape();
  points.forEach(([x, y], i) =>
    i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y),
  );
  shape.closePath();
  const g = new ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return g;
}

/** A round-ended slot or bar outline (a stadium), length l, width w, along x. */
export function stadium(l: number, w: number, n = 12): [number, number][] {
  const r = w / 2;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / n;
    pts.push([l / 2 + r * Math.cos(a), r * Math.sin(a)]);
  }
  for (let i = 0; i <= n; i++) {
    const a = Math.PI / 2 + (Math.PI * i) / n;
    pts.push([-l / 2 + r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

/** A tube (wire, hose) of radius r through the given points. */
export function tube(points: [number, number, number][], r: number) {
  const curve = new CatmullRomCurve3(points.map((p) => new Vector3(...p)));
  return new TubeGeometry(curve, 48, r, 10, false);
}

/** A coil spring along y: n turns of radius R, wire radius r, height h. */
export function spring(R: number, r: number, h: number, n: number) {
  const pts: Vector3[] = [];
  const steps = n * 24;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * n * Math.PI * 2;
    pts.push(
      new Vector3(R * Math.cos(a), -h / 2 + (h * i) / steps, R * Math.sin(a)),
    );
  }
  return new TubeGeometry(new CatmullRomCurve3(pts), steps, r, 8, false);
}

/** n small cylinders (screw heads, bolts) round a circle of radius R in the
 * xz plane, each of radius r and height h, at height y. */
export function boltCircle(
  n: number,
  R: number,
  r: number,
  h: number,
  y: number,
  role: Role,
  m: Materials,
  phase = 0,
): Group {
  const g = new Group();
  for (let i = 0; i < n; i++) {
    const a = phase + (i / n) * Math.PI * 2;
    g.add(
      at(part(cyl(r, h, 16), role, m), R * Math.cos(a), y, R * Math.sin(a)),
    );
  }
  return g;
}

/** Smooth back-and-forth between −1 and 1, period p seconds. */
export const swing = (t: number, p: number) => Math.sin((2 * Math.PI * t) / p);
