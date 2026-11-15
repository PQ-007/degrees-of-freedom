// 3D models for H2 Microcontrollers and computers (one per type key in
// content/hardware/computers.yaml), each matching its drawing's figureAlt.
// Boards lie flat (y up) and are first seen from above and in front. The
// moving part is in the row's colour: an LED that pulses, radio waves that
// spread, a flight controller that tilts, a fan that spins.
import { Group, TorusGeometry, type Object3D } from "three";
import {
  at,
  box,
  cyl,
  group,
  part,
  plate,
  ring,
  stadium,
  swing,
  type Materials,
  type PartRecipe,
} from "../kit";

const TAU = Math.PI * 2;
const BOARD = 0.06; // board thickness
const TOP = BOARD / 2; // the board's top surface (y)
const FROM_ABOVE: [number, number, number] = [0.45, 1.1, 1];

/** A flat board w × d (x × z), its top at y = TOP. */
const board = (w: number, d: number, m: Materials) =>
  part(box(w, BOARD, d), "body", m);

/** A part sitting on the board: w × h × d, centred at (x, z). */
const onBoard = (
  w: number,
  h: number,
  d: number,
  x: number,
  z: number,
  role: "body" | "dark" | "pale",
  m: Materials,
) => at(part(box(w, h, d), role, m), x, TOP + h / 2, z);

/** A pin header: n pins in `rows` rows along x, starting at (x, z). */
function header(
  n: number,
  rows: number,
  x: number,
  z: number,
  m: Materials,
): Group {
  const pitch = 0.1;
  const g = new Group();
  g.add(
    at(
      part(box(n * pitch, 0.08, rows * pitch), "dark", m),
      x + ((n - 1) * pitch) / 2,
      TOP + 0.04,
      z + ((rows - 1) * pitch) / 2,
    ),
  );
  for (let r = 0; r < rows; r++)
    for (let i = 0; i < n; i++)
      g.add(
        at(
          part(box(0.025, 0.2, 0.025), "pale", m, 1),
          x + i * pitch,
          TOP + 0.1,
          z + r * pitch,
        ),
      );
  return g;
}

/** A chip with legs along two or four sides: w × d, height h. */
function chip(
  w: number,
  d: number,
  h: number,
  x: number,
  z: number,
  legs: { along: "x" | "both"; n: number },
  m: Materials,
): Group {
  const g = new Group();
  g.add(onBoard(w, h, d, x, z, "dark", m));
  const leg = (lx: number, lz: number, horizontal: boolean) =>
    at(
      part(
        box(horizontal ? 0.03 : 0.07, 0.03, horizontal ? 0.07 : 0.03),
        "pale",
        m,
        1,
      ),
      lx,
      TOP + 0.02,
      lz,
    );
  const n = legs.n;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n - 0.5;
    g.add(leg(x + t * w * 0.92, z - d / 2 - 0.03, true));
    g.add(leg(x + t * w * 0.92, z + d / 2 + 0.03, true));
    if (legs.along === "both") {
      g.add(leg(x - w / 2 - 0.03, z + t * d * 0.92, false));
      g.add(leg(x + w / 2 + 0.03, z + t * d * 0.92, false));
    }
  }
  return g;
}

/** An LED that pulses: a small dome in the accent colour. */
function led(x: number, z: number, m: Materials) {
  const dome = at(part(box(0.08, 0.05, 0.06), "accent", m), x, TOP + 0.025, z);
  return {
    mesh: dome,
    pose: (t: number) => {
      const on = 0.5 + 0.5 * swing(t, 1.4);
      dome.scale.set(1, 0.4 + 0.9 * on, 1);
    },
  };
}

/** Mounting holes: little rings at the given (x, z). */
const holes = (pts: [number, number][], r: number, m: Materials) =>
  group(
    ...pts.map(([x, z]) =>
      at(
        part(ring(r, 0.012), "dark", m, 60),
        x,
        TOP + 0.005,
        z,
        Math.PI / 2,
        0,
        0,
      ),
    ),
  );

/** A small microcontroller board: a long chip with rows of legs, pin headers
 * along the edges, a USB socket, a power socket and a small LED. */
const mcu8bit: PartRecipe = (m) => {
  const light = led(0.55, -0.35, m);
  return {
    root: group(
      board(2.3, 1.7, m),
      chip(1.3, 0.3, 0.12, 0.25, 0.25, { along: "x", n: 14 }, m),
      header(10, 1, -0.55, -0.75, m),
      header(8, 1, 0.3, -0.75, m),
      header(8, 1, -0.3, 0.75, m),
      header(6, 1, 0.5, 0.75, m),
      onBoard(0.5, 0.42, 0.45, -1.05, -0.35, "pale", m), // USB socket
      onBoard(0.55, 0.4, 0.35, -1.05, 0.45, "dark", m), // power socket
      at(
        part(cyl(0.09, 0.4, 24), "pale", m),
        -1.18,
        TOP + 0.2,
        0.45,
        0,
        0,
        Math.PI / 2,
      ),
      onBoard(0.25, 0.14, 0.25, -0.35, -0.2, "dark", m), // regulator
      light.mesh,
      holes(
        [
          [-0.95, -0.7],
          [1.0, -0.7],
          [1.0, 0.65],
          [-0.75, 0.7],
        ],
        0.05,
        m,
      ),
    ),
    pose: light.pose,
    view: FROM_ABOVE,
  };
};

/** A long, narrow 32-bit board: a square chip, a smaller memory chip, a USB
 * socket at one end, a button, an LED and pin pads along both long edges. */
const mcu32bit: PartRecipe = (m) => {
  const light = led(-0.65, -0.18, m);
  const pads = new Group();
  for (let i = 0; i < 20; i++) {
    const x = -0.95 + i * 0.1;
    for (const z of [-0.29, 0.29])
      pads.add(at(part(cyl(0.025, 0.07, 12), "pale", m, 60), x, TOP, z));
  }
  return {
    root: group(
      board(2.1, 0.7, m),
      chip(0.32, 0.32, 0.06, 0.1, 0, { along: "both", n: 8 }, m),
      onBoard(0.22, 0.06, 0.16, 0.55, 0.05, "dark", m), // memory chip
      onBoard(0.3, 0.12, 0.3, -1.0, 0, "pale", m), // USB socket
      onBoard(0.14, 0.08, 0.14, -0.4, 0.12, "pale", m), // button
      at(part(cyl(0.05, 0.05, 20), "dark", m), -0.4, TOP + 0.1, 0.12),
      onBoard(0.1, 0.03, 0.1, 0.8, -0.1, "dark", m), // crystal
      pads,
      light.mesh,
    ),
    pose: light.pose,
    view: FROM_ABOVE,
  };
};

/** A small wireless module: a metal shield over the chip, a zigzag antenna
 * printed on the board above it, pins down both sides, radio waves. */
const mcuWireless: PartRecipe = (m) => {
  const zig: [number, number][] = [];
  for (let i = 0; i <= 8; i++)
    zig.push([-0.4 + i * 0.1, i % 2 === 0 ? -0.62 : -0.38]);
  const trace = new Group();
  zig.slice(1).forEach(([x, z], i) => {
    const [x0 = 0, z0 = 0] = zig[i] ?? [];
    const len = Math.hypot(x - x0, z - z0);
    trace.add(
      at(
        part(box(len, 0.012, 0.03), "dark", m, 60),
        (x + x0) / 2,
        TOP + 0.006,
        (z + z0) / 2,
        0,
        -Math.atan2(z - z0, x - x0),
        0,
      ),
    );
  });
  const pins = new Group();
  for (let i = 0; i < 9; i++)
    for (const x of [-0.6, 0.6])
      pins.add(
        at(
          part(box(0.08, 0.02, 0.05), "pale", m, 1),
          x,
          TOP + 0.01,
          -0.15 + i * 0.12,
        ),
      );
  // Radio waves: half-rings rising from the antenna, spreading outwards.
  const waves: Object3D[] = [];
  const waveGroup = new Group();
  for (let k = 0; k < 3; k++) {
    const arc = part(
      new TorusGeometry(0.12 + 0.12 * k, 0.014, 8, 40, Math.PI),
      "accent",
      m,
      60,
    );
    waves.push(arc);
    waveGroup.add(arc);
  }
  at(waveGroup, 0, TOP + 0.05, -0.5);
  return {
    root: group(
      board(1.3, 1.6, m),
      onBoard(1.0, 0.14, 0.9, 0, 0.25, "pale", m), // metal shield
      onBoard(0.12, 0.02, 0.12, 0.38, 0.6, "dark", m),
      trace,
      pins,
      waveGroup,
    ),
    pose: (t) =>
      waves.forEach((w, k) => {
        const s = 0.7 + ((t * 0.5 + k / 3) % 1) * 0.6;
        w.scale.set(s, s, s);
      }),
    view: FROM_ABOVE,
  };
};

/** A flight controller seen from above: a rounded box with an arrow on top
 * showing which way is forward, and connectors along its sides. It tilts
 * the way the drone tilts. */
const flightController: PartRecipe = (m) => {
  const shell = at(
    part(plate(stadium(0.9, 1.4), 0.4), "body", m),
    0,
    0,
    0,
    Math.PI / 2,
    0,
    0,
  );
  const lid = at(
    part(plate(stadium(0.86, 1.32), 0.04), "pale", m),
    0,
    0.22,
    0,
    Math.PI / 2,
    0,
    0,
  );
  const arrow = at(
    part(
      plate(
        [
          [0, 0.5],
          [0.3, 0.05],
          [0.1, 0.05],
          [0.1, -0.45],
          [-0.1, -0.45],
          [-0.1, 0.05],
          [-0.3, 0.05],
        ],
        0.03,
      ),
      "accent",
      m,
    ),
    0,
    0.255,
    0,
    -Math.PI / 2,
    0,
    0,
  );
  const plugs = new Group();
  // Along the two long sides (the case runs along x, ±0.7 in z).
  for (let i = 0; i < 4; i++)
    for (const z of [-0.74, 0.74])
      plugs.add(
        at(part(box(0.22, 0.14, 0.12), "dark", m), -0.42 + i * 0.28, 0, z),
      );
  const mounts = new Group();
  for (const [x, z] of [
    [-0.95, -0.3],
    [0.95, -0.3],
    [-0.95, 0.3],
    [0.95, 0.3],
  ] as const)
    mounts.add(at(part(cyl(0.09, 0.3, 20), "dark", m), x, -0.05, z));
  const unit = group(shell, lid, arrow, plugs, mounts);
  return {
    root: group(unit),
    pose: (t) => {
      unit.rotation.x = 0.18 * swing(t, 2.8);
      unit.rotation.z = 0.12 * swing(t + 0.7, 2.1);
    },
    view: [0.5, 0.9, 1],
  };
};

/** A single-board computer: a processor, a memory chip, a double row of
 * pins along one edge, stacked USB and network sockets on another, mounting
 * holes and an LED. */
const sbc: PartRecipe = (m) => {
  const light = led(-1.1, 0.55, m);
  return {
    root: group(
      board(2.6, 1.7, m),
      onBoard(0.55, 0.1, 0.55, -0.25, 0.1, "pale", m), // processor (metal lid)
      onBoard(0.45, 0.06, 0.35, 0.45, 0.1, "dark", m), // memory
      header(20, 2, -1.0, -0.75, m),
      onBoard(0.55, 0.5, 0.4, 1.05, -0.45, "pale", m), // USB stack
      onBoard(0.55, 0.5, 0.4, 1.05, 0.05, "pale", m), // USB stack
      onBoard(0.55, 0.42, 0.45, 1.05, 0.55, "pale", m), // network socket
      at(part(box(0.02, 0.28, 0.32), "dark", m), 1.33, TOP + 0.24, 0.55),
      onBoard(0.3, 0.12, 0.2, -0.95, 0.72, "pale", m), // USB-C power
      light.mesh,
      holes(
        [
          [-1.15, -0.62],
          [0.65, -0.62],
          [-1.15, 0.62],
          [0.65, 0.62],
        ],
        0.06,
        m,
      ),
    ),
    pose: light.pose,
    view: FROM_ABOVE,
  };
};

/** An AI computer: a module with a finned heatsink and a round fan on top,
 * sitting on a carrier board with sockets along its front. */
const aiComputer: PartRecipe = (m) => {
  const moduleTop = TOP + 0.12;
  const sinkTop = moduleTop + 0.06;
  const fins = new Group();
  for (let i = 0; i < 14; i++)
    fins.add(
      at(
        part(box(0.025, 0.28, 1.1), "pale", m),
        -0.6 + i * 0.093,
        sinkTop + 0.14,
        -0.05,
      ),
    );
  // Seven blades round a hub, each tilted like a fan blade.
  const blades = new Group();
  for (let i = 0; i < 7; i++) {
    const blade = at(
      part(plate(stadium(0.2, 0.1), 0.02), "accent", m),
      0.19,
      0,
      0,
      Math.PI / 2 + 0.35,
      0,
      0,
    );
    blades.add(at(group(blade), 0, 0, 0, 0, (i / 7) * TAU, 0));
  }
  const fanY = sinkTop + 0.32;
  const fan = at(
    group(part(cyl(0.08, 0.05, 20), "dark", m), blades),
    0,
    fanY,
    -0.05,
  );
  const front = 0.85;
  const sockets = group(
    onBoard(0.4, 0.3, 0.3, -0.9, front, "pale", m),
    onBoard(0.4, 0.3, 0.3, -0.45, front, "pale", m),
    onBoard(0.42, 0.36, 0.34, 0.05, front, "pale", m),
    onBoard(0.3, 0.15, 0.25, 0.5, front, "dark", m),
    onBoard(0.25, 0.25, 0.25, 0.9, front, "dark", m),
  );
  return {
    root: group(
      board(2.3, 2.0, m),
      onBoard(1.5, 0.12, 1.25, 0, -0.05, "dark", m), // module
      at(part(box(1.4, 0.06, 1.15), "pale", m), 0, moduleTop + 0.03, -0.05), // heatsink base
      fins,
      at(
        part(ring(0.36, 0.035), "dark", m, 60),
        0,
        fanY,
        -0.05,
        Math.PI / 2,
        0,
        0,
      ),
      fan,
      sockets,
      header(12, 2, -0.6, -0.95, m),
    ),
    pose: (t) => (blades.rotation.y = -t * 6),
    view: FROM_ABOVE,
  };
};

export const COMPUTER_MODELS: Record<string, PartRecipe> = {
  "mcu-8bit": mcu8bit,
  "mcu-32bit": mcu32bit,
  "mcu-wireless": mcuWireless,
  "flight-controller": flightController,
  sbc,
  "ai-computer": aiComputer,
};
