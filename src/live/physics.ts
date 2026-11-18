/* Pure gesture, rubber-band, inertial projection, detent snapping, and pointer velocity math. Zero DOM dependencies. */

/** Asymptotic UIScrollView rubber-band curve: slope `resistance` at 0, strictly bounded by `dimension`. */
export function rubberBand(overshoot: number, dimension: number, resistance = 0.55): number {
  if (!Number.isFinite(overshoot) || !Number.isFinite(dimension) || !Number.isFinite(resistance)) {
    throw new RangeError('rubberBand requires finite inputs');
  }
  const d = Math.abs(dimension);
  if (overshoot === 0 || d <= 0 || resistance <= 0) return 0;
  const sign = Math.sign(overshoot);
  const abs = Math.abs(overshoot);
  return (sign * d * abs * resistance) / (d + abs * resistance);
}

/** Projects an inertial stopping value given initial velocity (units/sec) and per-millisecond deceleration rate. */
export function projectMomentum(value: number, velocity: number, decelerationRate = 0.998): number {
  if (!Number.isFinite(value) || !Number.isFinite(velocity) || !Number.isFinite(decelerationRate)) {
    throw new RangeError('projectMomentum requires finite inputs');
  }
  if (velocity === 0) return value;
  const r = Math.min(0.9999, Math.max(0.001, decelerationRate));
  return value + (velocity / 1000) * (r / (1 - r));
}

/** Snaps a dragged value and release velocity to the projected detent, handling both normalized [0..1] and pixel detents. */
export function projectToDetent(
  value: number,
  velocity: number,
  detents: readonly number[],
  velocityThreshold = 450,
): number {
  if (detents.length === 0) throw new RangeError('detents must not be empty');
  const sorted = [...detents].sort((a, b) => a - b);
  if (sorted.length === 1) return sorted[0]!;

  const nearestIndex = (x: number): number => {
    let best = 0;
    let bestDist = Math.abs(sorted[0]! - x);
    for (let i = 1; i < sorted.length; i += 1) {
      const dist = Math.abs(sorted[i]! - x);
      if (dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    }
    return best;
  };

  const span = sorted[sorted.length - 1]! - sorted[0]!;
  let scaledVelocity = velocity;
  let isFlick = Math.abs(velocity) >= Math.max(0, velocityThreshold);

  // Normalize px/s pointer velocity when detents are expressed in unitless [0..1] ratios.
  if (span > 0 && span <= 2 && velocityThreshold > 10) {
    if (Math.abs(velocity) > 10) {
      scaledVelocity = velocity / 800;
      isFlick = Math.abs(velocity) >= velocityThreshold;
    } else {
      scaledVelocity = velocity;
      isFlick = Math.abs(velocity) * 800 >= velocityThreshold;
    }
  }

  if (!isFlick || velocity === 0) return sorted[nearestIndex(value)]!;

  const projIdx = nearestIndex(projectMomentum(value, scaledVelocity));
  if (velocity > 0) {
    const nextUp = sorted.findIndex((d) => d > value + 1e-6);
    return sorted[nextUp === -1 ? projIdx : Math.max(projIdx, nextUp)]!;
  }
  let prevDown = -1;
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    if (sorted[i]! < value - 1e-6) {
      prevDown = i;
      break;
    }
  }
  return sorted[prevDown === -1 ? projIdx : Math.min(projIdx, prevDown)]!;
}

interface PointerSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}

/** Bounded sliding-window pointer velocity estimator (returns px/second; prunes samples older than 100 ms). */
export class PointerVelocityTracker {
  private samples: PointerSample[] = [];
  private readonly windowMs: number;
  private readonly maxSamples: number;

  constructor(windowMs = 100, maxSamples = 16) {
    this.windowMs = Math.max(16, windowMs);
    this.maxSamples = Math.max(2, maxSamples);
  }

  addSample(x: number, y: number, timeMs: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(timeMs)) return;
    const prev = this.samples[this.samples.length - 1];
    if (prev && timeMs < prev.t) this.samples = [];
    const cutoff = timeMs - this.windowMs;
    let keepFrom = 0;
    while (keepFrom < this.samples.length && this.samples[keepFrom]!.t < cutoff) keepFrom += 1;
    if (keepFrom > 0) this.samples.splice(0, keepFrom);
    this.samples.push({ x, y, t: timeMs });
    if (this.samples.length > this.maxSamples) {
      this.samples.splice(0, this.samples.length - this.maxSamples);
    }
  }

  velocity(): { x: number; y: number } {
    const n = this.samples.length;
    if (n < 2) return { x: 0, y: 0 };
    const last = this.samples[n - 1]!;
    const cutoff = last.t - this.windowMs;
    let firstIdx = 0;
    while (firstIdx < n - 1 && this.samples[firstIdx]!.t < cutoff) firstIdx += 1;
    const first = this.samples[firstIdx]!;
    const dt = last.t - first.t;
    if (dt < 1) return { x: 0, y: 0 };
    return {
      x: ((last.x - first.x) / dt) * 1000,
      y: ((last.y - first.y) / dt) * 1000,
    };
  }

  reset(): void {
    this.samples = [];
  }
}
