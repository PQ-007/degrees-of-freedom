// The cart-pole demo's replay, recorded at build time with the real MuJoCo
// engine (in Node), for browsers without WebAssembly. Same model, same
// controller, same numbers as the live demo's default preset.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import load from "@mujoco/mujoco";
import type { APIRoute } from "astro";
import { recordReplay } from "../../demos/models/cartpole";
import { SimRunner } from "../../sim/runner";

export const GET: APIRoute = async () => {
  const mj = await load();
  const sim = new SimRunner(
    mj,
    readFileSync(join(process.cwd(), "content/models/cartpole.xml"), "utf8"),
  );
  const replay = recordReplay(sim);
  sim.dispose();
  return new Response(JSON.stringify(replay), {
    headers: { "Content-Type": "application/json" },
  });
};
