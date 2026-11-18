/* Motion gating and single-rAF job scheduler.
   'feedback' = a user-initiated state change, 'entrance' = page or section entrances,
   'ambient' = idle decoration. Reduced motion or a hidden page: nothing animates. Pause: only
   feedback animates, on the snap preset. Offscreen elements never animate. */
import { S, now, type SpringConfig } from './spring.js';

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

let reducedList: MediaQueryList | null = null;
let cachedMatchMedia: typeof matchMedia | undefined;
/** One cached media query list instead of a matchMedia call per job per frame. */
export function reducedQuery(): MediaQueryList | null {
  if (typeof matchMedia !== 'function') return null;
  if (!reducedList || cachedMatchMedia !== matchMedia) {
    cachedMatchMedia = matchMedia;
    reducedList = matchMedia('(prefers-reduced-motion: reduce)');
  }
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

/** Every attribute that turns motion down for a subtree below <html>: the component prop (motion={false} →
    data-motion="off"), a host-level reduced preference, and the legacy flag. JS springs honour all three; the
    page-level form on <html> is read by state(), so setMotionState() can still override it. */
export const REDUCED_SUBTREE = '[data-motion="off"], [data-motion="reduced"], [data-reduced-motion="true"]';

/** True when el sits inside a subtree whose motion is off or reduced. A descendant cannot opt back in. */
export function subtreeReduced(el?: Element | null): boolean {
  const hit = !!el && typeof el.closest === 'function' ? el.closest(REDUCED_SUBTREE) : null;
  return hit !== null && (typeof document === 'undefined' || hit !== document.documentElement);
}

export function onscreen(el?: Element | null): boolean {
  if (!el || typeof innerHeight === 'undefined') return true;
  const r = el.getBoundingClientRect();
  return r.width + r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
}

export function allowed(kind: MotionKind = 'feedback', el?: Element | null): boolean {
  if (!KINDS.includes(kind)) throw new TypeError(`Unknown motion kind: ${kind}`);
  return allowedWith(state(), kind, el);
}

/* Per-job check against an already-read MotionState. Same predicate as allowed():
   callers hoist one state() read per frame pass instead of one per job per frame.
   The kind guard is repeated so tick()/sync() keep the throw for unknown kinds. */
function allowedWith(s: MotionState, kind: MotionKind, el?: Element | null): boolean {
  if (!KINDS.includes(kind)) throw new TypeError(`Unknown motion kind: ${kind}`);
  if (s.reduced || s.hidden) return false;
  if (s.paused && kind !== 'feedback') return false;
  if (!el) return true;
  // A host can reduce motion for one subtree (a dialog with its own preference); a descendant cannot opt back in.
  if (subtreeReduced(el)) return false;
  return onscreen(el);
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
let raf: number | null = null;
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
  raf = null;
  const t = now();
  const s = state();
  // Snapshot: a step may add or cancel jobs, and new jobs wait for the next frame.
  for (const job of [...jobs]) {
    if (!jobs.has(job)) continue;
    if (!allowedWith(s, job.kind ?? 'feedback')) {
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
  if (jobs.size && raf === null) raf = requestAnimationFrame(tick);
}

/** When the motion state changes, running springs that are no longer allowed jump to their end state. */
export function sync(): void {
  const s = state();
  for (const job of [...jobs]) {
    if (!jobs.has(job)) continue;
    if (!allowedWith(s, job.kind ?? 'feedback')) settle(job);
  }
  if (!jobs.size && raf !== null) {
    cancelAnimationFrame(raf);
    raf = null;
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
  if (raf === null) raf = requestAnimationFrame(tick);
  return () => {
    if (jobs.has(job)) settle(job);
    if (!jobs.size && raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  };
}

export const active = (): number => jobs.size;
