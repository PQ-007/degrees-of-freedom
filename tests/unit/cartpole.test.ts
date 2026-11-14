// The cart-pole demo in the real engine: each preset does what its label says.
import { readFileSync } from "node:fs";
import load from "@mujoco/mujoco";
import { beforeAll, describe, expect, it } from "vitest";
import {
  CARTPOLE,
  PRESETS,
  cartpoleController,
  isFallen,
  type Preset,
} from "../../src/demos/models/cartpole";
import { SimRunner, type Mujoco } from "../../src/sim/runner";

const xml = readFileSync(
  new URL("../../content/models/cartpole.xml", import.meta.url),
  "utf8",
);
let mj: Mujoco;
beforeAll(async () => {
  mj = await load();
});

/** 12 s from the starting tilt, with a push at 3 s. */
function run(id: Preset["id"]) {
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) throw new Error(id);
  const sim = new SimRunner(mj, xml);
  sim.controller = cartpoleController(preset.gains);
  sim.reset([0, CARTPOLE.startTilt]);
  let fellAt: number | undefined;
  let maxX = 0;
  let lateTilt = 0;
  while (sim.data.time < 12) {
    if (Math.abs(sim.data.time - 3) < sim.timestep / 2)
      sim.push("pole", [CARTPOLE.push.force, 0, 0], CARTPOLE.push.duration);
    sim.step();
    const q = sim.data.qpos as Float64Array;
    if (fellAt === undefined && isFallen(q)) fellAt = sim.data.time;
    maxX = Math.max(maxX, Math.abs(q[0] ?? 0));
    if (sim.data.time > 10) lateTilt = Math.max(lateTilt, Math.abs(q[1] ?? 0));
  }
  const x = (sim.data.qpos as Float64Array)[0] ?? 0;
  sim.dispose();
  return { fellAt, maxX, lateTilt, x };
}

describe("the cart-pole model", () => {
  it("loads, with a cart, a pole and one motor", () => {
    const sim = new SimRunner(mj, xml);
    expect(sim.model.nq).toBe(2);
    expect(sim.model.nu).toBe(1);
    expect(sim.timestep).toBe(0.002);
    sim.dispose();
  });
});

describe("the presets", () => {
  it("P + D balances, recovers from the push and comes back to the middle", () => {
    const r = run("pd");
    expect(r.fellAt).toBeUndefined();
    expect(r.maxX).toBeLessThan(1.2);
    expect(r.lateTilt).toBeLessThan(0.02);
    expect(Math.abs(r.x)).toBeLessThan(0.1);
  });

  it("only P falls within two seconds", () => {
    expect(run("p").fellAt).toBeLessThan(2);
  });

  it("too little P topples", () => {
    expect(run("low-p").fellAt).toBeDefined();
  });

  it("too much D stays up but wanders along the rail", () => {
    const r = run("high-d");
    expect(r.fellAt).toBeUndefined();
    expect(r.maxX).toBeGreaterThan(0.6);
  });
});
