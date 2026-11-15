// 3D models for H3 Sensors (one per type key in content/hardware/sensors.yaml),
// each matching its drawing's figureAlt. The moving part is in the row's
// Sense colour: a slotted disc that spins, axes that tilt, waves and light
// that travel, a lidar head that turns, an iris that opens and closes.
import { ConeGeometry, Group, TorusGeometry, type Object3D } from "three";
import {
  at,
  ball,
  box,
  cyl,
  group,
  part,
  plate,
  ring,
  swing,
  tube,
  type Materials,
  type PartRecipe,
  type Role,
} from "../kit";

const TAU = Math.PI * 2;

/** An arrow along +y from the origin: shaft and head, length l. */
function arrow(l: number, r: number, role: Role, m: Materials): Group {
  const head = 3.2 * r;
  return group(
    at(part(cyl(r, l - head, 16), role, m), 0, (l - head) / 2, 0),
    at(part(new ConeGeometry(r * 2.4, head, 20), role, m), 0, l - head / 2, 0),
  );
}

/** An encoder: a slotted disc on a shaft, and a fork-shaped sensor
 * straddling its rim to count the slots as they pass. */
const encoder: PartRecipe = (m) => {
  // The disc: a ring of 24 slots cut into its rim (drawn as an outline).
  const pts: [number, number][] = [];
  const slots = 24;
  for (let i = 0; i < slots; i++) {
    const a0 = (i / slots) * TAU;
    const a1 = ((i + 0.5) / slots) * TAU;
    const a2 = ((i + 1) / slots) * TAU;
    pts.push([0.95 * Math.cos(a0), 0.95 * Math.sin(a0)]);
    pts.push([0.95 * Math.cos(a1), 0.95 * Math.sin(a1)]);
    pts.push([0.78 * Math.cos(a1), 0.78 * Math.sin(a1)]);
    pts.push([0.78 * Math.cos(a2), 0.78 * Math.sin(a2)]);
  }
  const disc = part(plate(pts, 0.04), "accent", m, 50);
  const hub = part(cyl(0.16, 0.12), "dark", m);
  hub.rotation.x = Math.PI / 2;
  const wheel = group(disc, hub);
  const shaft = at(
    part(cyl(0.06, 1.0, 16), "pale", m),
    0,
    0,
    -0.35,
    Math.PI / 2,
    0,
    0,
  );
  const motor = at(
    part(cyl(0.45, 0.8), "body", m),
    0,
    0,
    -1.1,
    Math.PI / 2,
    0,
    0,
  );
  // The fork: two arms either side of the disc's rim, on a base.
  const fork = group(
    at(part(box(0.3, 0.32, 0.14), "dark", m), 0, 0, 0.14),
    at(part(box(0.3, 0.32, 0.14), "dark", m), 0, 0, -0.14),
    at(part(box(0.3, 0.12, 0.42), "dark", m), 0, -0.2, 0),
  );
  at(fork, 0, 0.92, 0);
  const wires = part(
    tube(
      [
        [0, 1.05, -0.1],
        [0.1, 1.35, -0.4],
        [0.5, 1.4, -0.8],
      ],
      0.03,
    ),
    "dark",
    m,
  );
  return {
    root: group(motor, shaft, wheel, fork, wires),
    pose: (t) => (wheel.rotation.z = -t * 1.5),
    view: [0.8, 0.45, 1],
  };
};

/** An IMU chip with three arrows from one corner, for its three axes,
 * tilting as if the robot moved. */
const imu: PartRecipe = (m) => {
  const board = part(box(1.4, 0.06, 1.4), "body", m);
  const chip = at(part(box(0.5, 0.1, 0.5), "dark", m), 0, 0.08, 0);
  const dot = at(part(cyl(0.03, 0.02, 12), "pale", m), -0.17, 0.14, 0.17);
  const pins = new Group();
  for (let i = 0; i < 6; i++)
    pins.add(
      at(part(cyl(0.04, 0.07, 12), "pale", m, 60), -0.5 + i * 0.2, 0.03, 0.6),
    );
  const axes = group(
    arrow(1.0, 0.035, "accent", m), // y: up
    at(arrow(1.0, 0.035, "accent", m), 0, 0, 0, 0, 0, -Math.PI / 2), // x
    at(arrow(1.0, 0.035, "accent", m), 0, 0, 0, Math.PI / 2, 0, 0), // z
  );
  at(axes, -0.55, 0.05, -0.55);
  const unit = group(board, chip, dot, pins, axes);
  return {
    root: group(unit),
    pose: (t) => {
      unit.rotation.x = 0.25 * swing(t, 3.2);
      unit.rotation.z = 0.2 * swing(t + 0.8, 2.6);
    },
  };
};

/** An ultrasonic distance sensor: a small board with two round transducers
 * side by side, and sound waves spreading out from one. */
const ultrasonic: PartRecipe = (m) => {
  const board = part(box(1.8, 0.85, 0.06), "body", m);
  const can = (x: number) =>
    group(
      at(part(cyl(0.33, 0.4), "pale", m), x, 0, 0.23, Math.PI / 2, 0, 0),
      at(part(ring(0.2, 0.025), "dark", m, 60), x, 0, 0.43),
      at(part(ring(0.1, 0.02), "dark", m, 60), x, 0, 0.43),
    );
  const crystal = at(part(box(0.3, 0.12, 0.1), "dark", m), 0, 0.3, 0.08);
  const pins = new Group();
  for (let i = 0; i < 4; i++)
    pins.add(
      at(part(box(0.04, 0.35, 0.04), "pale", m, 1), -0.15 + i * 0.1, -0.55, 0),
    );
  const waves: Object3D[] = [];
  const spread = new Group();
  for (let k = 0; k < 3; k++) {
    // A ring facing forwards, like a wave front leaving the transducer.
    const arc = part(ring(0.3, 0.016), "accent", m, 60);
    waves.push(arc);
    spread.add(arc);
  }
  // The rings travel out in front of the left transducer, along +z.
  at(spread, -0.45, 0, 0.45);
  return {
    root: group(board, can(-0.45), can(0.45), crystal, pins, spread),
    pose: (t) =>
      waves.forEach((w, k) => {
        const f = (t * 0.6 + k / 3) % 1;
        w.position.set(0, 0, 0.05 + f * 0.9);
        const s = 1 + f * 1.1;
        w.scale.set(s, s, s);
      }),
  };
};

/** A time-of-flight sensor: a small board with a chip sending a beam of light
 * to a wall and back. */
const tof: PartRecipe = (m) => {
  const board = at(part(box(0.7, 0.7, 0.06), "body", m), -1.0, 0, 0);
  const chip = at(part(box(0.3, 0.16, 0.1), "dark", m), -1.0, 0, 0.08);
  const windows = group(
    at(
      part(cyl(0.035, 0.02, 12), "pale", m),
      -1.07,
      0,
      0.14,
      Math.PI / 2,
      0,
      0,
    ),
    at(
      part(cyl(0.035, 0.02, 12), "pale", m),
      -0.93,
      0,
      0.14,
      Math.PI / 2,
      0,
      0,
    ),
  );
  const wall = at(part(box(0.12, 1.4, 1.2), "pale", m), 1.2, 0, 0.6);
  // The sensor faces +z; the beam runs out to the wall, which stands off to
  // the side, and comes back: drawn as two thin lines and a travelling dot.
  const from = [-1.07, 0, 0.16] as const;
  const hit = [1.14, 0, 0.75] as const;
  const back = [-0.93, 0, 0.16] as const;
  const beam = (a: readonly number[], b: readonly number[]) =>
    part(
      tube(
        [
          [a[0] ?? 0, a[1] ?? 0, a[2] ?? 0],
          [
            ((a[0] ?? 0) + (b[0] ?? 0)) / 2,
            0.06,
            ((a[2] ?? 0) + (b[2] ?? 0)) / 2,
          ],
          [b[0] ?? 0, b[1] ?? 0, b[2] ?? 0],
        ],
        0.01,
      ),
      "accent",
      m,
      60,
    );
  const pulse = part(ball(0.06), "accent", m, 60);
  return {
    root: group(
      board,
      chip,
      windows,
      wall,
      beam(from, hit),
      beam(hit, back),
      pulse,
    ),
    pose: (t) => {
      const f = (t * 0.5) % 1;
      const [a, b, u] =
        f < 0.5 ? [from, hit, f * 2] : [hit, back, (f - 0.5) * 2];
      pulse.position.set(
        (a[0] ?? 0) + ((b[0] ?? 0) - (a[0] ?? 0)) * u,
        0.06 * Math.sin(Math.PI * u),
        (a[2] ?? 0) + ((b[2] ?? 0) - (a[2] ?? 0)) * u,
      );
    },
  };
};

/** A 2D lidar: a round spinning head on a square base, with a laser beam
 * reaching out from its window. */
const lidar: PartRecipe = (m) => {
  const base = part(box(1.3, 0.35, 1.3), "body", m);
  const motorBox = at(part(box(0.35, 0.2, 0.3), "dark", m), 0.45, 0.28, 0.4);
  const headBody = at(part(cyl(0.5, 0.45), "pale", m), 0, 0.42, 0);
  const lid = at(part(cyl(0.5, 0.06), "dark", m), 0, 0.68, 0);
  const window_ = at(part(box(0.3, 0.16, 0.06), "dark", m), 0, 0.42, 0.49);
  const beamLen = 1.4;
  const beam = at(
    part(cyl(0.015, beamLen, 8), "accent", m, 60),
    0,
    0.42,
    0.5 + beamLen / 2,
    Math.PI / 2,
    0,
    0,
  );
  const spot = at(part(ball(0.05), "accent", m, 60), 0, 0.42, 0.5 + beamLen);
  const head = group(headBody, lid, window_, beam, spot);
  const cable = part(
    tube(
      [
        [-0.65, 0, 0.3],
        [-0.95, -0.05, 0.4],
        [-1.2, 0, 0.8],
      ],
      0.035,
    ),
    "dark",
    m,
  );
  return {
    root: group(base, motorBox, head, cable),
    pose: (t) => (head.rotation.y = t * 1.6),
    view: [0.55, 0.8, 1],
  };
};

/** A small camera board with a round lens, the aperture blades visible
 * inside it, opening and closing. */
const camera: PartRecipe = (m) => {
  const board = part(box(1.4, 1.4, 0.06), "body", m);
  const holes = group(
    ...[
      [-0.55, -0.55],
      [0.55, -0.55],
      [-0.55, 0.55],
      [0.55, 0.55],
    ].map(([x = 0, y = 0]) =>
      at(part(ring(0.07, 0.012), "dark", m, 60), x, y, 0.04),
    ),
  );
  const housing = at(part(box(0.75, 0.75, 0.25), "dark", m), 0, 0, 0.15);
  const barrel = at(
    part(cyl(0.3, 0.25), "pale", m),
    0,
    0,
    0.4,
    Math.PI / 2,
    0,
    0,
  );
  const rim = at(part(ring(0.29, 0.03), "dark", m, 60), 0, 0, 0.56);
  // The lens's dark middle, with the iris blades in front of it.
  const glass = at(
    part(cyl(0.26, 0.02), "dark", m),
    0,
    0,
    0.53,
    Math.PI / 2,
    0,
    0,
  );
  // Six blades round the opening, each turning about its outer pivot.
  const blades: Object3D[] = [];
  const iris = new Group();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    const blade = at(
      part(
        plate(
          [
            [0, 0],
            [0.24, 0.02],
            [0.16, 0.13],
          ],
          0.01,
        ),
        "accent",
        m,
        60,
      ),
      -0.24,
      0,
      0,
    );
    const pivot = at(
      group(blade),
      0.24 * Math.cos(a),
      0.24 * Math.sin(a),
      0.545,
      0,
      0,
      a,
    );
    blades.push(blade);
    iris.add(pivot);
  }
  const connector = at(part(box(0.9, 0.18, 0.12), "pale", m), 0, -0.6, 0.09);
  return {
    root: group(board, holes, housing, barrel, glass, iris, rim, connector),
    pose: (t) => {
      const open = 0.5 + 0.5 * swing(t, 3);
      for (const b of blades) b.rotation.z = 0.15 + 0.5 * open;
    },
    view: [0.45, 0.35, 1],
  };
};

/** A depth camera: a long bar with two lenses at its ends and a projector
 * between them, casting a pattern of dots ahead. */
const depthCamera: PartRecipe = (m) => {
  const bar = part(box(2.0, 0.4, 0.35), "body", m);
  const face = at(part(box(1.9, 0.3, 0.02), "dark", m), 0, 0, 0.18);
  const lens = (x: number) =>
    group(
      at(part(cyl(0.11, 0.06, 24), "pale", m), x, 0, 0.21, Math.PI / 2, 0, 0),
      at(part(ring(0.11, 0.015), "dark", m, 60), x, 0, 0.24),
    );
  const projector = at(
    part(cyl(0.07, 0.06, 20), "pale", m),
    0.25,
    0,
    0.21,
    Math.PI / 2,
    0,
    0,
  );
  const mount = at(part(cyl(0.12, 0.3, 20), "dark", m), 0, -0.35, 0);
  // The dots: a grid ahead, drifting out from the projector.
  const dots = new Group();
  for (let i = -3; i <= 3; i++)
    for (let j = -2; j <= 2; j++)
      dots.add(at(part(ball(0.025), "accent", m, 60), i * 0.17, j * 0.15, 0));
  at(dots, 0.25, 0, 0.9);
  return {
    root: group(bar, face, lens(-0.75), lens(0.75), projector, mount, dots),
    pose: (t) => {
      const f = (t * 0.4) % 1;
      dots.position.z = 0.5 + f * 0.8;
      const s = 0.6 + f * 0.8;
      dots.scale.set(s, s, 1);
    },
  };
};

/** A force/torque sensor: a round sensor between two plates, one fixed to
 * the robot and one to its tool, with arrows for push and twist. */
const forceTorque: PartRecipe = (m) => {
  const robotPlate = at(part(cyl(0.8, 0.12), "dark", m), 0, -0.55, 0);
  const sensor = at(part(cyl(0.6, 0.6), "body", m), 0, -0.15, 0);
  const band = at(part(cyl(0.62, 0.08), "pale", m), 0, -0.15, 0);
  const cable = part(
    tube(
      [
        [0.6, -0.15, 0],
        [0.95, -0.2, 0.1],
        [1.2, -0.45, 0.4],
      ],
      0.04,
    ),
    "dark",
    m,
  );
  const toolPlate = part(cyl(0.7, 0.12), "body", m);
  const tool = at(part(cyl(0.18, 0.5, 24), "dark", m), 0, 0.31, 0);
  const push = at(arrow(0.6, 0.03, "accent", m), 0, 1.3, 0, Math.PI, 0, 0);
  const twist = at(
    part(new TorusGeometry(0.42, 0.025, 8, 40, Math.PI * 1.4), "accent", m, 60),
    0,
    0.7,
    0,
    Math.PI / 2,
    0,
    0,
  );
  const twistHead = at(
    part(new ConeGeometry(0.06, 0.15, 16), "accent", m),
    0.42,
    0.7,
    0,
    Math.PI / 2,
    0,
    0,
  );
  const top = group(toolPlate, tool, push, twist, twistHead);
  at(top, 0, 0.21, 0);
  return {
    root: group(robotPlate, sensor, band, cable, top),
    pose: (t) => {
      const s = swing(t, 2.4);
      top.position.y = 0.21 - 0.05 * (0.5 + 0.5 * s);
      top.rotation.y = 0.25 * s;
    },
  };
};

export const SENSOR_MODELS: Record<string, PartRecipe> = {
  encoder,
  imu,
  ultrasonic,
  tof,
  lidar,
  camera,
  "depth-camera": depthCamera,
  "force-torque": forceTorque,
};
