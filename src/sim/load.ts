// Loads the MuJoCo WebAssembly engine once per page, only when a demo asks
// (the .wasm is about 3 MB gzipped; docs/PLAN.md "How MuJoCo demos load").
import type { Mujoco } from "./runner";

let engine: Promise<Mujoco> | undefined;

export function loadMujoco(): Promise<Mujoco> {
  engine ??= (async () => {
    const [{ default: factory }, { default: wasmUrl }] = await Promise.all([
      import("@mujoco/mujoco"),
      import("@mujoco/mujoco/mujoco.wasm?url"),
    ]);
    return factory({ locateFile: () => wasmUrl });
  })();
  // A failed load (offline, blocked) can be retried.
  engine.catch(() => (engine = undefined));
  return engine;
}

export function hasWebAssembly(): boolean {
  return (
    typeof WebAssembly === "object" &&
    typeof WebAssembly.instantiate === "function"
  );
}

/** Three.js needs WebGL 2. */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return canvas.getContext("webgl2") !== null;
  } catch {
    return false;
  }
}
