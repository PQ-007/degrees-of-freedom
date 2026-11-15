// Every part's 3D model, by its Hardware type key (src/three/part-keys.ts
// lists the same keys without loading Three.js; a unit test keeps them equal).
import type { PartRecipe } from "../kit";
import { MOTOR_MODELS } from "./motors";

export const PART_MODELS: Record<string, PartRecipe> = { ...MOTOR_MODELS };
