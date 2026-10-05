/* Spring core: closed-form, critically damped springs. A frame is a pure function of time and nothing
   overshoots. One rAF loop runs only while a job still moves; when idle it requests no frames.
   Safe to import on the server: browser APIs are touched only when a motion runs. */

export interface SpringConfig {
  /** Natural frequency in rad/s. Settles (99.9%) in about 9.2 / w seconds. */
  w: number;
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

/** Offset left after dt seconds for a critically damped spring released at offset x0 with velocity v0. */
export const resp = (dt: number, x0: number, v0: number, cfg: SpringConfig): number =>
  dt <= 0 ? x0 : Math.exp(-cfg.w * dt) * (x0 + (v0 + cfg.w * x0) * dt);

/** Velocity of the same spring after dt seconds. */
export const vel = (dt: number, x0: number, v0: number, cfg: SpringConfig): number =>
  dt <= 0 ? v0 : Math.exp(-cfg.w * dt) * (v0 - cfg.w * (v0 + cfg.w * x0) * dt);

/** 0 → 1 progress of a step that started at t0. */
export const prog = (t: number, t0: number, cfg: SpringConfig = S.base): number => 1 - resp(t - t0, 1, 0, cfg);

/** Seconds until a unit step is within `epsilon` of its target. */
export function settleTime(cfg: SpringConfig, epsilon = 1e-3): number {
  let lo = 0;
  let hi = 60 / cfg.w;
  for (let i = 0; i < 50; i += 1) {
    const mid = (lo + hi) / 2;
    if (resp(mid, 1, 0, cfg) > epsilon) lo = mid;
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
    let v = this.target;
    for (const e of this.ev) v += resp(t - e.t, e.x0, e.v0, e.cfg);
    return v;
  }

  velocity(t = now()): number {
    let v = 0;
    for (const e of this.ev) v += vel(t - e.t, e.x0, e.v0, e.cfg);
    return v;
  }

  /** Drops springs whose remaining envelope is under 1e-3; returns how many still move. */
  prune(t = now()): number {
    this.ev = this.ev.filter(
      (e) => t < e.t || Math.exp(-e.cfg.w * (t - e.t)) * (1 + e.cfg.w * (t - e.t)) * (Math.abs(e.x0) + Math.abs(e.v0) / e.cfg.w) > 1e-3,
    );
    return this.ev.length;
  }

  get moving(): boolean {
    return this.ev.length > 0;
  }
}

/* Gating. 'feedback' = a user-initiated state change, 'entrance' = page or section entrances,
   'ambient' = idle decoration. Reduced motion or a hidden page: nothing animates. Pause: only
   feedback animates, on the snap preset. Offscreen elements never animate. */
export type MotionKind = 'feedback' | 'entrance' | 'ambient';
export interface MotionState {
  paused: boolean;
  reduced: boolean;
  hidden: boolean;
}

const KINDS: MotionKind[] = ['feedback', 'entrance', 'ambient'];
let override: (() => Partial<MotionState>) | null = null;

/** Lets an app supply its own pause / reduced-motion switch. Call setMotionState(null) to restore defaults. */
export function setMotionState(fn: (() => Partial<MotionState>) | null): void {
  override = fn;
  sync();
}

let reducedList: MediaQueryList | null | undefined;
/** One cached media query list instead of a matchMedia call per job per frame. */
export function reducedQuery(): MediaQueryList | null {
  if (reducedList === undefined) reducedList = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  return reducedList;
}

export function state(): MotionState {
  const hasDom = typeof document !== 'undefined';
  const root = hasDom ? document.documentElement.dataset : null;
  /* data-motion="full" overrides the OS setting, as in tokens.css; "reduced" forces it on. */
  const reduced = root?.motion === 'full' ? false : reducedQuery()?.matches === true || root?.reducedMotion === 'true' || root?.motion === 'reduced';
  const base: MotionState = {
    paused: false,
    reduced,
    hidden: hasDom && document.hidden,
  };
  return override ? { ...base, ...override() } : base;
}

export function onscreen(el?: Element | null): boolean {
  if (!el || typeof innerHeight === 'undefined') return true;
  const r = el.getBoundingClientRect();
  return r.width + r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
}

export function allowed(kind: MotionKind = 'feedback', el?: Element | null): boolean {
  if (!KINDS.includes(kind)) throw new TypeError(`Unknown motion kind: ${kind}`);
  const s = state();
  if (s.reduced || s.hidden) return false;
  if (s.paused && kind !== 'feedback') return false;
  return el ? onscreen(el) : true;
}

/** The preset a helper should use: paused feedback still shows, on the fastest spring. */
export const config = (kind: MotionKind, cfg: SpringConfig = S.base): SpringConfig => (state().paused && kind === 'feedback' ? S.snap : cfg);

/* The loop. A job is { step(t) -> true while moving, kind, finish() }. finish() sets the final state. */
export interface Job {
  step: (t: number) => boolean | void;
  kind?: MotionKind;
  finish?: () => void;
}

const jobs = new Set<Job>();
let raf = 0;
let listening = false;

function settle(job: Job): void {
  jobs.delete(job);
  try {
    job.finish?.();
  } catch (error) {
    console.error(error);
  }
}

function tick(): void {
  raf = 0;
  const t = now();
  for (const job of [...jobs]) {
    if (!jobs.has(job)) continue;
    if (!allowed(job.kind ?? 'feedback')) {
      settle(job);
      continue;
    }
    let moving = false;
    try {
      moving = job.step(t) === true;
    } catch (error) {
      console.error(error);
    }
    if (!moving && jobs.has(job)) settle(job);
  }
  if (jobs.size && !raf) raf = requestAnimationFrame(tick);
}

/** When the motion state changes, running springs that are no longer allowed jump to their end state. */
export function sync(): void {
  for (const job of [...jobs]) if (!allowed(job.kind ?? 'feedback')) settle(job);
  if (!jobs.size && raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

function listen(): void {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  document.addEventListener('motion:change', sync);
  document.addEventListener('visibilitychange', sync);
  reducedQuery()?.addEventListener('change', sync);
}

const noop = (): void => {};

/** Schedules a job and returns cancel(), which finishes it at once. Disallowed jobs finish immediately. */
export function run(step: Job | Job['step'], opts: { kind?: MotionKind; finish?: () => void } = {}): () => void {
  const job: Job = typeof step === 'function' ? { step, kind: opts.kind ?? 'feedback', finish: opts.finish } : { ...step, kind: step.kind ?? 'feedback' };
  if (!allowed(job.kind) || typeof requestAnimationFrame !== 'function') {
    settle(job);
    return noop;
  }
  listen();
  jobs.add(job);
  if (!raf) raf = requestAnimationFrame(tick);
  return () => {
    if (jobs.has(job)) settle(job);
  };
}

export const active = (): number => jobs.size;
