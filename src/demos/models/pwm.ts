// PWM driving a motor: pure, no DOM (tests/unit/pwm.test.ts).
//
// The voltage is switched fully on for a share D of each period T = 1/f (the
// duty cycle) and off for the rest, so its average is D · V. A motor can't
// change speed instantly: here its speed s (as a share of full speed) follows
// the switched input u with a time constant τ,
//
//   ds/dt = (u − s) / τ
//
// so it climbs while the voltage is on and coasts down while it is off. In
// the repeating steady state, with b = D·T/τ and a = (1 − D)·T/τ,
//
//   s_max = (1 − e^(−b)) / (1 − e^(−(a + b))),   s_min = s_max · e^(−a)
//
// and the average speed is exactly D. The faster the switching compared
// with τ, the smaller the ripple between s_min and s_max.

/** The motor's time constant, s: how quickly it responds (an assumption). */
export const TAU = 0.05;

export function averageVoltage(duty: number, supply: number): number {
  return duty * supply;
}

export function speedRange(duty: number, f: number, tau = TAU) {
  if (duty <= 0) return { min: 0, max: 0 };
  if (duty >= 1) return { min: 1, max: 1 };
  const T = 1 / f;
  const b = (duty * T) / tau;
  const a = ((1 - duty) * T) / tau;
  const max = (1 - Math.exp(-b)) / (1 - Math.exp(-(a + b)));
  return { min: max * Math.exp(-a), max };
}

export function ripple(duty: number, f: number, tau = TAU): number {
  const r = speedRange(duty, f, tau);
  return r.max - r.min;
}

/** `periods` periods of the steady state, n samples each: [t, u, s]. */
export function waveform(
  duty: number,
  f: number,
  periods = 3,
  n = 200,
  tau = TAU,
): [number, number, number][] {
  const T = 1 / f;
  const out: [number, number, number][] = [];
  let s = speedRange(duty, f, tau).min;
  const dt = T / n;
  for (let i = 0; i <= periods * n; i++) {
    const t = i * dt;
    const u = (t % T) / T < duty - 1e-12 ? 1 : 0;
    out.push([t, u, s]);
    // Exact step for a constant input over dt.
    s = u + (s - u) * Math.exp(-dt / tau);
  }
  return out;
}
