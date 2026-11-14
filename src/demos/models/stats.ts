// Noise, averages and histograms: pure, no DOM (tests/unit/stats.test.ts).
//
// A distance sensor reads a wall at a true distance, plus Gaussian noise with
// standard deviation σ. Averaging n readings gives a number whose spread is
// σ/√n: four readings halve the noise, a hundred cut it to a tenth.

/** A small seeded random generator (mulberry32), so results repeat. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A normal (Gaussian) random number, by the Box-Muller method. */
export function gaussian(rand: () => number, mean: number, sd: number): number {
  const u = 1 - rand(); // (0, 1], so the log is finite
  const v = rand();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function mean(xs: readonly number[]): number {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

/** The sample standard deviation (dividing by n − 1). */
export function std(xs: readonly number[]): number {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}

/** Counts in `bins` equal bins from lo to hi; values outside are left out. */
export function histogram(
  xs: readonly number[],
  lo: number,
  hi: number,
  bins: number,
): number[] {
  const counts = new Array<number>(bins).fill(0);
  const w = (hi - lo) / bins;
  for (const x of xs) {
    const i = Math.floor((x - lo) / w);
    if (i >= 0 && i < bins) counts[i] = (counts[i] ?? 0) + 1;
  }
  return counts;
}

export function normalPdf(x: number, mu: number, sd: number): number {
  return (
    Math.exp(-((x - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI))
  );
}

export interface Readings {
  /** One reading per trial. */
  singles: number[];
  /** The average of n readings per trial. */
  averages: number[];
}

/** `trials` times: take n readings of a wall at `truth` with noise σ. */
export function takeReadings(opts: {
  truth: number;
  sd: number;
  n: number;
  trials: number;
  seed: number;
}): Readings {
  const rand = seeded(opts.seed);
  const singles: number[] = [];
  const averages: number[] = [];
  for (let k = 0; k < opts.trials; k++) {
    let sum = 0;
    for (let i = 0; i < opts.n; i++) {
      const r = gaussian(rand, opts.truth, opts.sd);
      if (i === 0) singles.push(r);
      sum += r;
    }
    averages.push(sum / opts.n);
  }
  return { singles, averages };
}

/** Bayes' rule for a yes/no detector: P(thing | alarm). */
export function posterior(opts: {
  /** How often the thing is there at all (the base rate). */
  prior: number;
  /** P(alarm | thing there). */
  hit: number;
  /** P(alarm | thing not there). */
  falseAlarm: number;
}): number {
  const yes = opts.hit * opts.prior;
  return yes / (yes + opts.falseAlarm * (1 - opts.prior));
}
