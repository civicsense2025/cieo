/* Spring core: closed-form, critically damped (default) or bounded underdamped springs.
   A frame is a pure function of time. One rAF loop runs only while a job still moves; when idle it
   requests no frames. Safe to import on the server: browser APIs are touched only when a motion runs. */
import { state } from './scheduler.js';

export interface SpringConfig {
  /** Natural frequency in rad/s. Settles (99.9%) in about 9.2 / w seconds at critical damping. */
  w: number;
  /** Optional damping ratio (0.7 <= z <= 1.0, default 1). Clamped to 1 when reduced motion is active. */
  z?: number;
}

export const S = {
  snap: { w: 34 },
  base: { w: 22 },
  soft: { w: 15 },
  lazy: { w: 9 },
} as const satisfies Record<string, SpringConfig>;

export type Preset = keyof typeof S;
export const EXIT = 0.1;
export const LAG = 0.06;
export const BLUR = 4;
export const STAGGER_MAX = 0.3;
export const ARRIVE = 0.45;

export const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
export const clamp = (v: number, a = 0, b = 1): number => Math.min(b, Math.max(a, v));

const resolveZ = (cfg: SpringConfig): number =>
  cfg.z === undefined || !Number.isFinite(cfg.z) || state().reduced ? 1 : clamp(cfg.z, 0.7, 1);

/** Offset left after dt seconds for a spring released at offset x0 with velocity v0. */
export function resp(dt: number, x0: number, v0: number, cfg: SpringConfig): number {
  if (dt <= 0) return x0;
  const z = resolveZ(cfg);
  if (z >= 1) return Math.exp(-cfg.w * dt) * (x0 + (v0 + cfg.w * x0) * dt);
  const a = z * cfg.w;
  const wd = cfg.w * Math.sqrt(1 - z * z);
  return Math.exp(-a * dt) * (x0 * Math.cos(wd * dt) + ((v0 + a * x0) / wd) * Math.sin(wd * dt));
}

/** Velocity of the same spring after dt seconds. */
export function vel(dt: number, x0: number, v0: number, cfg: SpringConfig): number {
  if (dt <= 0) return v0;
  const z = resolveZ(cfg);
  if (z >= 1) return Math.exp(-cfg.w * dt) * (v0 - cfg.w * (v0 + cfg.w * x0) * dt);
  const a = z * cfg.w;
  const wd = cfg.w * Math.sqrt(1 - z * z);
  return Math.exp(-a * dt) * (v0 * Math.cos(wd * dt) - ((a * v0 + cfg.w * cfg.w * x0) / wd) * Math.sin(wd * dt));
}

/** 0 → 1 progress of a step that started at t0. */
export const prog = (t: number, t0: number, cfg: SpringConfig = S.base): number => 1 - resp(t - t0, 1, 0, cfg);

/** Seconds until a unit step stays within `epsilon` of its target. */
export function settleTime(cfg: SpringConfig, epsilon = 1e-3): number {
  const z = resolveZ(cfg);
  if (z >= 1) {
    let lo = 0;
    let hi = 60 / cfg.w;
    for (let i = 0; i < 50; i += 1) {
      const mid = (lo + hi) / 2;
      if (resp(mid, 1, 0, cfg) > epsilon) lo = mid;
      else hi = mid;
    }
    return hi;
  }
  const a = z * cfg.w;
  const wd = cfg.w * Math.sqrt(1 - z * z);
  let lo = 0;
  let hi = 60 / a;
  for (let i = 0; i < 50; i += 1) {
    const mid = (lo + hi) / 2;
    const m = Math.min(mid, 1 / wd);
    if (Math.exp(-a * mid) * (1 + a * m) > epsilon) lo = mid;
    else hi = mid;
  }
  return hi;
}

interface SpringEvent {
  t: number;
  x0: number;
  v0: number;
  cfg: SpringConfig;
}

/** A value that retargets as a sum of springs: each new target adds one spring from its own start time. */
export class Track {
  target: number;
  cfg: SpringConfig;
  private ev: SpringEvent[] = [];

  constructor(v: number, cfg: SpringConfig = S.base) {
    this.target = v;
    this.cfg = cfg;
  }

  set(to: number, cfg: SpringConfig = this.cfg, t = now()): this {
    if (to === this.target) return this;
    this.ev.push({ t, x0: this.target - to, v0: 0, cfg });
    this.target = to;
    if (this.ev.length > 12) this.prune(t);
    return this;
  }

  /** Restarts from `from` with velocity v0 (units per second), e.g. after a drag ends. */
  release(from: number, v0: number, to: number, cfg: SpringConfig = this.cfg, t = now()): this {
    this.ev = [{ t, x0: from - to, v0, cfg }];
    this.target = to;
    return this;
  }

  jump(v: number): this {
    this.ev = [];
    this.target = v;
    return this;
  }

  at(t = now()): number {
    const events = this.ev;
    const n = events.length;
    if (n === 0) return this.target;
    let v = this.target;
    for (let i = 0; i < n; i += 1) {
      const e = events[i];
      const dt = t - e.t;
      v += dt <= 0 ? e.x0 : resp(dt, e.x0, e.v0, e.cfg);
    }
    return v;
  }

  velocity(t = now()): number {
    const events = this.ev;
    const n = events.length;
    if (n === 0) return 0;
    let v = 0;
    for (let i = 0; i < n; i += 1) {
      const e = events[i];
      const dt = t - e.t;
      v += dt <= 0 ? e.v0 : vel(dt, e.x0, e.v0, e.cfg);
    }
    return v;
  }

  /** Drops springs whose remaining envelope is under 1e-3; returns how many still move. */
  prune(t = now()): number {
    const events = this.ev;
    const n = events.length;
    if (n === 0) return 0;
    let kept = 0;
    for (let i = 0; i < n; i += 1) {
      const e = events[i];
      const age = t - e.t;
      if (age < 0) {
        if (kept !== i) events[kept] = e;
        kept += 1;
        continue;
      }
      const w = e.cfg.w;
      const z = resolveZ(e.cfg);
      let env: number;
      if (z >= 1) {
        const wAge = w * age;
        env = Math.exp(-wAge) * (1 + wAge) * (Math.abs(e.x0) + Math.abs(e.v0) / w);
      } else {
        const a = z * w;
        const wd = w * Math.sqrt(1 - z * z);
        const m = Math.min(age, 1 / wd);
        env = Math.exp(-a * age) * (Math.abs(e.x0) * (1 + a * m) + Math.abs(e.v0) * m);
      }
      if (env > 1e-3) {
        if (kept !== i) events[kept] = e;
        kept += 1;
      }
    }
    if (kept !== n) events.length = kept;
    return kept;
  }

  get moving(): boolean {
    return this.ev.length > 0;
  }
}

export {
  setMotionState,
  reducedQuery,
  state,
  REDUCED_SUBTREE,
  subtreeReduced,
  onscreen,
  allowed,
  config,
  sync,
  run,
  active,
  type MotionKind,
  type MotionState,
  type Job,
} from './scheduler.js';
