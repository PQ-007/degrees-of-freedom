// A magnet moving through a coil: pure, no DOM (tests/unit/induction.test.ts).
//
// A small magnet (a dipole of moment m) sits on the axis of a coil of radius
// R and N turns, at distance x from its centre. The magnetic flux through one
// turn is
//
//   Φ(x) = μ0 · m · R² / (2 · (R² + x²)^(3/2))
//
// and moving the magnet changes it. Faraday's law gives the voltage:
//
//   ε = −N · dΦ/dt = −N · (dΦ/dx) · v
//
// so it grows with the speed and the number of turns, is zero when the
// magnet stops, and changes sign between moving in and moving out.

export const MU0 = 4e-7 * Math.PI;

export interface Setup {
  /** Magnet's dipole moment, A·m² (a small, strong magnet). */
  moment: number;
  /** Coil radius, m. */
  radius: number;
  /** How far the magnet swings either side of the coil's centre, m. */
  amplitude: number;
}

export const SETUP: Setup = { moment: 0.9, radius: 0.018, amplitude: 0.06 };

export function flux(x: number, s: Setup = SETUP): number {
  const r2 = s.radius ** 2;
  return (MU0 * s.moment * r2) / (2 * (r2 + x * x) ** 1.5);
}

export function fluxSlope(x: number, s: Setup = SETUP): number {
  const r2 = s.radius ** 2;
  return (-3 * MU0 * s.moment * r2 * x) / (2 * (r2 + x * x) ** 2.5);
}

/** The voltage across N turns with the magnet at x moving at v (m/s). */
export function emf(
  turns: number,
  x: number,
  v: number,
  s: Setup = SETUP,
): number {
  return -turns * fluxSlope(x, s) * v;
}

/** The magnet's position and speed when it swings f times a second. */
export function motion(t: number, f: number, s: Setup = SETUP) {
  const w = 2 * Math.PI * f;
  return {
    x: s.amplitude * Math.sin(w * t),
    v: s.amplitude * w * Math.cos(w * t),
  };
}

/** The largest voltage over one swing, V. */
export function peakEmf(turns: number, f: number, s: Setup = SETUP): number {
  let peak = 0;
  for (let i = 0; i < 2000; i++) {
    const { x, v } = motion(i / (2000 * f), f, s);
    peak = Math.max(peak, Math.abs(emf(turns, x, v, s)));
  }
  return peak;
}
