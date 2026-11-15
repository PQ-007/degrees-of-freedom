// 3D models for H1 Motors and actuators (one per type key in
// content/hardware/motors.yaml). Each matches the type's drawing and its
// figureAlt description, so the page's description fits the model too. The
// part that moves is in the accent colour and moves in `pose(t)`. Sizes are
// in model units: each model fits in about a 2.6-unit cube round the origin;
// y is up, z points at the viewer.
import { Group } from "three";
import {
  at,
  ball,
  boltCircle,
  box,
  cyl,
  dShaft,
  gear,
  group,
  part,
  plate,
  ringGear,
  spring,
  stadium,
  swing,
  tube,
  type PartRecipe,
} from "../kit";

const TAU = Math.PI * 2;

/** A small cylindrical motor with a gearbox block on its front, an output
 * shaft, and two wires at the back. */
const gearmotor: PartRecipe = (m) => {
  const can = at(
    part(cyl(0.42, 1.2), "body", m),
    -0.45,
    0,
    0,
    0,
    0,
    Math.PI / 2,
  );
  const cap = at(part(cyl(0.3, 0.1), "dark", m), -1.1, 0, 0, 0, 0, Math.PI / 2);
  const tabs = group(
    at(part(box(0.06, 0.16, 0.1), "dark", m), -1.18, 0.14, 0),
    at(part(box(0.06, 0.16, 0.1), "dark", m), -1.18, -0.14, 0),
  );
  const wires = group(
    part(
      tube(
        [
          [-1.2, 0.2, 0],
          [-1.45, 0.35, 0.1],
          [-1.6, 0.2, 0.4],
        ],
        0.035,
      ),
      "dark",
      m,
    ),
    part(
      tube(
        [
          [-1.2, -0.2, 0],
          [-1.45, -0.3, 0.1],
          [-1.6, -0.1, 0.45],
        ],
        0.035,
      ),
      "dark",
      m,
    ),
  );
  const gearbox = at(part(box(0.55, 0.92, 0.92), "body", m), 0.42, 0, 0);
  const plateFront = at(part(box(0.06, 0.92, 0.92), "dark", m), 0.72, 0, 0);
  const screws = group(
    at(
      part(cyl(0.05, 0.05, 16), "dark", m),
      0.77,
      0.34,
      0.34,
      0,
      0,
      Math.PI / 2,
    ),
    at(
      part(cyl(0.05, 0.05, 16), "dark", m),
      0.77,
      -0.34,
      -0.34,
      0,
      0,
      Math.PI / 2,
    ),
  );
  const boss = at(
    part(cyl(0.16, 0.08), "body", m),
    0.79,
    0,
    0,
    0,
    0,
    Math.PI / 2,
  );
  const shaft = part(dShaft(0.09, 0.55), "accent", m);
  const holder = at(group(shaft), 1.08, 0, 0, 0, Math.PI / 2, 0);
  return {
    root: group(
      can,
      cap,
      tabs,
      wires,
      gearbox,
      plateFront,
      screws,
      boss,
      holder,
    ),
    pose: (t) => (shaft.rotation.z = t * 2.5),
  };
};

/** A hobby servo: a box with a mounting ear at each end, the output spline
 * near one end with a single-arm horn on it, and three wires out the other. */
const hobbyServo: PartRecipe = (m) => {
  const bodyBox = at(part(box(1.7, 0.85, 0.85), "body", m), 0, -0.1, 0);
  const ears = at(
    part(
      plate(
        [
          [-1.15, -0.42],
          [1.15, -0.42],
          [1.15, 0.42],
          [-1.15, 0.42],
        ],
        0.08,
      ),
      "body",
      m,
    ),
    0,
    0.12,
    0,
    Math.PI / 2,
    0,
    0,
  );
  const holes = group(
    ...[-1.0, 1.0].map((x) =>
      at(part(cyl(0.07, 0.1, 16), "dark", m), x, 0.12, 0),
    ),
  );
  const lid = at(part(box(1.7, 0.08, 0.85), "dark", m), 0, 0.37, 0);
  const spline = at(part(cyl(0.13, 0.22), "dark", m), 0.45, 0.5, 0);
  const arm = at(
    part(plate(stadium(0.75, 0.24), 0.06), "accent", m),
    0.37,
    0,
    0,
    Math.PI / 2,
    0,
    0,
  );
  const armHoles = group(
    ...[0.25, 0.45, 0.65].map((x) =>
      at(part(cyl(0.035, 0.08, 12), "dark", m), x, 0, 0),
    ),
  );
  const hub = part(cyl(0.16, 0.1), "accent", m);
  const horn = at(group(arm, armHoles, hub), 0.45, 0.63, 0);
  const wires = group(
    ...[-0.1, 0, 0.1].map((z) =>
      part(
        tube(
          [
            [-0.85, -0.2, z],
            [-1.2, -0.25, z * 1.5],
            [-1.5, -0.1, 0.3 + z],
          ],
          0.03,
        ),
        "dark",
        m,
      ),
    ),
  );
  return {
    root: group(bodyBox, ears, holes, lid, spline, horn, wires),
    pose: (t) => (horn.rotation.y = 0.9 * swing(t, 2.4)),
  };
};

/** Two smart bus servos joined by one data cable that runs on to the next. */
const busServo: PartRecipe = (m) => {
  const horns: Group[] = [];
  const servo = (x: number) => {
    const shell = part(box(0.8, 1.0, 0.75), "body", m);
    const band = at(part(box(0.82, 0.12, 0.77), "dark", m), 0, -0.25, 0);
    const plug = at(part(box(0.22, 0.14, 0.12), "dark", m), -0.2, -0.25, -0.42);
    const plug2 = at(part(box(0.22, 0.14, 0.12), "dark", m), 0.2, -0.25, -0.42);
    const disk = part(cyl(0.3, 0.06), "accent", m);
    const horn = at(
      group(disk, boltCircle(4, 0.2, 0.035, 0.08, 0.02, "dark", m)),
      0.1,
      0.53,
      0.05,
    );
    horns.push(horn);
    return at(group(shell, band, plug, plug2, horn), x, 0, 0);
  };
  // The plugs sit at x = ±0.2 from each servo's centre, at the back.
  const cable = group(
    part(
      tube(
        [
          [-0.6, -0.25, -0.48],
          [-0.3, -0.5, -0.75],
          [0.3, -0.5, -0.75],
          [0.6, -0.25, -0.48],
        ],
        0.03,
      ),
      "dark",
      m,
    ),
    part(
      tube(
        [
          [1.0, -0.25, -0.48],
          [1.15, -0.45, -0.7],
          [1.3, -0.35, -0.3],
          [1.35, -0.2, 0.1],
        ],
        0.03,
      ),
      "dark",
      m,
    ),
    part(
      tube(
        [
          [-1.0, -0.25, -0.48],
          [-1.15, -0.45, -0.7],
          [-1.3, -0.35, -0.3],
        ],
        0.03,
      ),
      "dark",
      m,
    ),
  );
  return {
    root: group(servo(-0.8), servo(0.8), cable),
    pose: (t) => {
      const [a, b] = horns;
      if (a) a.rotation.y = 1.2 * swing(t, 3);
      if (b) b.rotation.y = -1.2 * swing(t + 0.4, 3);
    },
  };
};

/** A square stepper (NEMA-17 style) seen from the front: four mounting
 * holes, a round boss, the shaft, and tick marks round it for its steps. */
const stepper: PartRecipe = (m) => {
  const s = 1.4;
  const body = part(box(s, s, 1.1), "body", m);
  const front = at(part(box(s + 0.02, s + 0.02, 0.18), "dark", m), 0, 0, 0.5);
  const back = at(part(box(s + 0.02, s + 0.02, 0.18), "dark", m), 0, 0, -0.5);
  const screws = group(
    ...[
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ].map(([a = 0, b = 0]) =>
      at(
        part(cyl(0.07, 0.06, 16), "body", m),
        a * 0.52,
        b * 0.52,
        0.62,
        Math.PI / 2,
        0,
        0,
      ),
    ),
  );
  const boss = at(
    part(cyl(0.32, 0.08), "body", m),
    0,
    0,
    0.63,
    Math.PI / 2,
    0,
    0,
  );
  const ticks = new Group();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    ticks.add(
      at(
        part(box(0.025, 0.09, 0.02), "pale", m),
        0.44 * Math.cos(a),
        0.44 * Math.sin(a),
        0.6,
        0,
        0,
        a + Math.PI / 2,
      ),
    );
  }
  const shaft = at(part(dShaft(0.08, 0.6), "accent", m), 0, 0, 0.95);
  const connector = at(part(box(0.5, 0.2, 0.3), "dark", m), 0, -0.78, -0.25);
  const wires = group(
    ...[-0.15, -0.05, 0.05, 0.15].map((x) =>
      part(
        tube(
          [
            [x, -0.86, -0.25],
            [x * 1.4, -1.1, -0.45],
            [x * 2, -1.2, -0.9],
          ],
          0.025,
        ),
        "dark",
        m,
      ),
    ),
  );
  return {
    root: group(
      body,
      front,
      back,
      screws,
      boss,
      ticks,
      shaft,
      connector,
      wires,
    ),
    // It moves in steps: a jump, then a pause, never a smooth turn.
    pose: (t) => (shaft.rotation.z = -Math.floor(t * 4) * (TAU / 24)),
  };
};

/** A brushless motor on a planetary gearbox, the gearbox open at the front:
 * a sun gear in the middle, three planets round it, inside a ring. */
const bldcGearbox: PartRecipe = (m) => {
  const zs = 12;
  const zp = 12;
  const zr = 36;
  // Pitch radii in proportion to the teeth: sun 0.2, planets 0.2, ring 0.6.
  const rs = zs / 60;
  const rp = zp / 60;
  const rr = zr / 60;
  const ring = part(ringGear(zr, rr, rr + 0.28, 0.3), "body", m);
  const housing = at(
    part(cyl(rr + 0.28, 0.5), "body", m),
    0,
    0,
    -0.42,
    Math.PI / 2,
    0,
    0,
  );
  const bell = at(
    part(cyl(0.78, 0.55), "dark", m),
    0,
    0,
    -0.95,
    Math.PI / 2,
    0,
    0,
  );
  const vents = boltCircle(8, 0.55, 0.06, 0.58, 0, "body", m);
  at(vents, 0, 0, -0.95, Math.PI / 2, 0, 0);
  const wires = group(
    ...[-0.12, 0, 0.12].map((x) =>
      part(
        tube(
          [
            [x, -0.7, -1.1],
            [x * 1.3, -1.0, -1.25],
            [x * 2, -1.25, -1.0],
          ],
          0.03,
        ),
        "dark",
        m,
      ),
    ),
  );
  const sun = part(gear(zs, rs, 0.24), "accent", m);
  const carrier = new Group();
  const planets: Group[] = [];
  const tri = part(
    plate(
      [0, 1, 2].map((k) => {
        const a = (k / 3) * TAU + Math.PI / 2;
        return [0.4 * Math.cos(a), 0.4 * Math.sin(a)] as [number, number];
      }),
      0.05,
    ),
    "accent",
    m,
  );
  at(tri, 0, 0, -0.17);
  carrier.add(tri);
  for (let k = 0; k < 3; k++) {
    const pl = new Group();
    pl.add(part(gear(zp, rp, 0.24), "body", m));
    pl.add(at(part(cyl(0.05, 0.3, 16), "dark", m), 0, 0, 0, Math.PI / 2, 0, 0));
    planets.push(pl);
    carrier.add(pl);
  }
  const ps = TAU / zs;
  const pp = TAU / zp;
  return {
    root: group(ring, housing, bell, vents, wires, sun, carrier),
    pose: (t) => {
      const ths = t * 1.6; // the sun (input) turns
      const thc = (ths * zs) / (zs + zr); // the carrier (output) follows, slower
      sun.rotation.z = ths;
      planets.forEach((pl, k) => {
        const phi = thc + (k / 3) * TAU + Math.PI / 2;
        pl.position.set(
          (rs + rp) * Math.cos(phi),
          (rs + rp) * Math.sin(phi),
          0,
        );
        // Tooth meets gap where planet and sun touch (see the C2 demo).
        const fs = (phi - ths) / ps;
        pl.rotation.z = phi + Math.PI - pp / 2 + pp * fs;
      });
      tri.rotation.z = thc;
    },
  };
};

/** A quasi-direct-drive actuator: a large, flat round motor with a leg link
 * hanging from its centre, ending in a foot. */
const qdd: PartRecipe = (m) => {
  const can = at(
    part(cyl(0.95, 0.4), "body", m),
    0,
    0.45,
    -0.1,
    Math.PI / 2,
    0,
    0,
  );
  const rim = at(
    part(cyl(0.98, 0.08), "dark", m),
    0,
    0.45,
    -0.3,
    Math.PI / 2,
    0,
    0,
  );
  const bolts = at(
    boltCircle(8, 0.82, 0.045, 0.44, 0, "dark", m),
    0,
    0.45,
    -0.1,
    Math.PI / 2,
    0,
    0,
  );
  const cable = part(
    tube(
      [
        [0.6, 0.95, -0.25],
        [0.9, 1.25, -0.35],
        [1.3, 1.3, -0.2],
      ],
      0.04,
    ),
    "dark",
    m,
  );
  const flange = part(cyl(0.38, 0.1), "accent", m);
  at(flange, 0, 0, 0.15, Math.PI / 2, 0, 0);
  const flangeBolts = at(
    boltCircle(6, 0.27, 0.035, 0.14, 0, "dark", m),
    0,
    0,
    0.15,
    Math.PI / 2,
    0,
    0,
  );
  const link = at(
    part(plate(stadium(1.3, 0.26), 0.1), "accent", m),
    0,
    -0.65,
    0.25,
    0,
    0,
    Math.PI / 2,
  );
  const foot = at(part(ball(0.16), "dark", m), 0, -1.3, 0.25);
  // The leg's parts are placed relative to its pivot, the motor's centre.
  const leg = at(group(flange, flangeBolts, link, foot), 0, 0.45, 0);
  return {
    root: group(can, rim, bolts, cable, leg),
    pose: (t) => (leg.rotation.z = 0.5 * swing(t, 2.2)),
  };
};

/** A strain-wave (harmonic) gear: a rigid ring with teeth inside, a thin
 * flexible toothed ring within it, and an oval wave generator in the middle.
 * As the oval turns, the flexible ring's teeth creep round slowly. */
const harmonic: PartRecipe = (m) => {
  const zr = 60;
  const zf = 58;
  const r = 0.9;
  const circular = part(ringGear(zr, r, r + 0.28, 0.3), "body", m);
  const back = at(
    part(cyl(r + 0.28, 0.3), "dark", m),
    0,
    0,
    -0.32,
    Math.PI / 2,
    0,
    0,
  );
  const bolts = boltCircle(12, r + 0.14, 0.035, 0.34, 0.0, "dark", m);
  at(bolts, 0, 0, 0.01, Math.PI / 2, 0, 0);
  // The flexspline: a toothed ring, squeezed into an oval by the generator.
  const flexTeeth = part(gear(zf, (zf / zr) * r, 0.24), "body", m, 50);
  const flexBore = at(
    part(cyl((zf / zr) * r - 0.1, 0.25), "pale", m),
    0,
    0,
    0,
    Math.PI / 2,
    0,
    0,
  );
  const flexSpin = group(flexTeeth, flexBore);
  const flexOval = group(flexSpin);
  flexOval.scale.set(1.03, 0.97, 1);
  const flexTurn = group(flexOval);
  const wave = part(cyl(0.62, 0.28), "accent", m);
  at(wave, 0, 0, 0.02, Math.PI / 2, 0, 0);
  const waveOval = group(
    wave,
    at(part(cyl(0.12, 0.34, 20), "dark", m), 0, 0, 0.02, Math.PI / 2, 0, 0),
  );
  waveOval.scale.set(1.12, 0.86, 1);
  const waveTurn = group(waveOval);
  return {
    root: group(back, circular, bolts, flexTurn, waveTurn),
    pose: (t) => {
      const th = t * 1.2;
      waveTurn.rotation.z = th;
      flexTurn.rotation.z = th; // the oval follows the generator
      // Teeth creep backwards by (zr − zf) teeth per turn of the generator.
      flexSpin.rotation.z = -th - (th * (zr - zf)) / zf;
    },
  };
};

/** A series elastic actuator: a motor and gearbox, then a coil spring, then
 * the load it moves. */
const sea: PartRecipe = (m) => {
  const can = at(part(cyl(0.4, 0.9), "body", m), -1.0, 0, 0, 0, 0, Math.PI / 2);
  const box1 = at(part(box(0.4, 0.8, 0.8), "dark", m), -0.38, 0, 0);
  const plateA = at(
    part(cyl(0.38, 0.06), "body", m),
    -0.15,
    0,
    0,
    0,
    0,
    Math.PI / 2,
  );
  // The spring runs from the gearbox's plate (x = −0.15) along +x; its
  // geometry starts at 0, so squeezing it (scale) keeps that end in place.
  const springGeo = spring(0.26, 0.05, 1, 6);
  springGeo.translate(0, 0.5, 0);
  const coil = part(springGeo, "accent", m);
  const coilHold = at(group(coil), -0.15, 0, 0, 0, 0, -Math.PI / 2);
  const plateB = at(
    part(cyl(0.38, 0.06), "body", m),
    0,
    0,
    0,
    0,
    0,
    Math.PI / 2,
  );
  const arm = at(
    part(plate(stadium(0.9, 0.24), 0.1), "body", m),
    0.15,
    -0.4,
    0,
    0,
    0,
    Math.PI / 2,
  );
  const weight = at(part(box(0.4, 0.3, 0.3), "dark", m), 0.15, -0.95, 0);
  const load = group(plateB, arm, weight);
  return {
    root: group(can, box1, plateA, coilHold, load),
    pose: (t) => {
      // The spring stretches and squeezes as the load pushes back.
      const k = 0.85 + 0.15 * swing(t, 1.8);
      coil.scale.set(1, k, 1);
      load.position.x = -0.15 + k + 0.03;
      load.rotation.x = 0.15 * swing(t, 1.8);
    },
  };
};

/** A hydraulic cylinder: a barrel, a piston rod coming out of one end, and a
 * hose to a pump. */
const hydraulic: PartRecipe = (m) => {
  const barrel = at(
    part(cyl(0.3, 1.6), "body", m),
    -0.3,
    0,
    0,
    0,
    0,
    Math.PI / 2,
  );
  const capA = at(
    part(cyl(0.34, 0.14), "dark", m),
    -1.12,
    0,
    0,
    0,
    0,
    Math.PI / 2,
  );
  const capB = at(
    part(cyl(0.34, 0.14), "dark", m),
    0.52,
    0,
    0,
    0,
    0,
    Math.PI / 2,
  );
  const mount = at(
    part(plate(stadium(0.01, 0.34), 0.2), "dark", m),
    -1.35,
    0,
    0,
  );
  const ports = group(
    at(part(cyl(0.07, 0.18, 16), "dark", m), -0.95, 0.36, 0),
    at(part(cyl(0.07, 0.18, 16), "dark", m), 0.35, 0.36, 0),
  );
  const hoses = group(
    part(
      tube(
        [
          [-0.95, 0.45, 0],
          [-0.9, 0.9, 0.1],
          [-0.4, 1.15, 0.3],
          [0.2, 1.1, 0.5],
        ],
        0.05,
      ),
      "dark",
      m,
    ),
    part(
      tube(
        [
          [0.35, 0.45, 0],
          [0.4, 0.75, 0.2],
          [0.3, 1.0, 0.5],
        ],
        0.05,
      ),
      "dark",
      m,
    ),
  );
  const pump = at(part(box(0.5, 0.35, 0.4), "body", m), 0.35, 1.15, 0.6);
  const pumpMotor = at(
    part(cyl(0.16, 0.4), "dark", m),
    0.85,
    1.15,
    0.6,
    0,
    0,
    Math.PI / 2,
  );
  const rod = at(
    part(cyl(0.11, 1.4), "accent", m),
    0.3,
    0,
    0,
    0,
    0,
    Math.PI / 2,
  );
  const eye = at(
    part(plate(stadium(0.01, 0.3), 0.14), "accent", m),
    1.05,
    0,
    0,
  );
  const piston = group(rod, eye);
  return {
    root: group(
      barrel,
      capA,
      capB,
      mount,
      ports,
      hoses,
      pump,
      pumpMotor,
      piston,
    ),
    pose: (t) => (piston.position.x = 0.25 + 0.25 * swing(t, 3)),
  };
};

/** A pneumatic gripper: a body with an air line on top and two fingers
 * closing on a round object. */
const pneumatic: PartRecipe = (m) => {
  const bodyBox = at(part(box(1.1, 0.6, 0.6), "body", m), 0, 0.5, 0);
  const rail = at(part(box(1.2, 0.1, 0.4), "dark", m), 0, 0.15, 0);
  const fitting = at(part(cyl(0.08, 0.2, 16), "dark", m), 0.2, 0.9, 0);
  const hose = part(
    tube(
      [
        [0.2, 0.95, 0],
        [0.25, 1.25, 0.1],
        [0.7, 1.35, 0.3],
        [1.2, 1.25, 0.3],
      ],
      0.05,
    ),
    "pale",
    m,
  );
  // A finger, its rubber pad on the side facing the object (side ±1).
  const finger = (side: number) =>
    group(
      at(part(box(0.18, 0.25, 0.36), "accent", m), 0, 0.05, 0),
      at(part(box(0.12, 0.7, 0.3), "accent", m), 0, -0.4, 0),
      at(part(box(0.06, 0.35, 0.3), "dark", m), -side * 0.08, -0.55, 0),
    );
  const left = finger(-1);
  const right = finger(1);
  const object = at(part(ball(0.25), "pale", m), 0, -0.6, 0);
  return {
    root: group(bodyBox, rail, fitting, hose, left, right, object),
    pose: (t) => {
      // Open, then close until the pads touch the ball (radius 0.25).
      // Pads touch the ball (radius 0.25) when the gap is 0.36.
      const gap = 0.36 + 0.22 * (0.5 + 0.5 * swing(t, 2.6));
      left.position.x = -gap;
      right.position.x = gap;
    },
  };
};

export const MOTOR_MODELS: Record<string, PartRecipe> = {
  gearmotor,
  "hobby-servo": hobbyServo,
  "bus-servo": busServo,
  stepper,
  "bldc-gearbox": bldcGearbox,
  qdd,
  harmonic,
  sea,
  hydraulic,
  pneumatic,
};
