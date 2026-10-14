/* Spring core: closed-form, critically damped springs. A frame is a pure function of time and nothing
   overshoots. One rAF loop runs only while a job still moves; when idle it requests no frames.
   Safe to import on the server: browser APIs are touched only when a motion runs. */
export const S = {
    snap: { w: 34 },
    base: { w: 22 },
    soft: { w: 15 },
    lazy: { w: 9 },
};
export const EXIT = 0.1;
export const LAG = 0.06;
export const BLUR = 4;
export const STAGGER_MAX = 0.3;
export const ARRIVE = 0.45;
export const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** Offset left after dt seconds for a critically damped spring released at offset x0 with velocity v0. */
export const resp = (dt, x0, v0, cfg) => dt <= 0 ? x0 : Math.exp(-cfg.w * dt) * (x0 + (v0 + cfg.w * x0) * dt);
/** Velocity of the same spring after dt seconds. */
export const vel = (dt, x0, v0, cfg) => dt <= 0 ? v0 : Math.exp(-cfg.w * dt) * (v0 - cfg.w * (v0 + cfg.w * x0) * dt);
/** 0 → 1 progress of a step that started at t0. */
export const prog = (t, t0, cfg = S.base) => 1 - resp(t - t0, 1, 0, cfg);
/** Seconds until a unit step is within `epsilon` of its target. */
export function settleTime(cfg, epsilon = 1e-3) {
    let lo = 0;
    let hi = 60 / cfg.w;
    for (let i = 0; i < 50; i += 1) {
        const mid = (lo + hi) / 2;
        if (resp(mid, 1, 0, cfg) > epsilon)
            lo = mid;
        else
            hi = mid;
    }
    return hi;
}
/** A value that retargets as a sum of springs: each new target adds one spring from its own start time. */
export class Track {
    constructor(v, cfg = S.base) {
        this.ev = [];
        this.target = v;
        this.cfg = cfg;
    }
    set(to, cfg = this.cfg, t = now()) {
        if (to === this.target)
            return this;
        this.ev.push({ t, x0: this.target - to, v0: 0, cfg });
        this.target = to;
        if (this.ev.length > 12)
            this.prune(t);
        return this;
    }
    /** Restarts from `from` with velocity v0 (units per second), e.g. after a drag ends. */
    release(from, v0, to, cfg = this.cfg, t = now()) {
        this.ev = [{ t, x0: from - to, v0, cfg }];
        this.target = to;
        return this;
    }
    jump(v) {
        this.ev = [];
        this.target = v;
        return this;
    }
    at(t = now()) {
        const events = this.ev;
        const n = events.length;
        if (n === 0)
            return this.target;
        let v = this.target;
        for (let i = 0; i < n; i += 1) {
            const e = events[i];
            const dt = t - e.t;
            // resp(dt <= 0) is exactly x0, without touching Math.exp.
            v += dt <= 0 ? e.x0 : resp(dt, e.x0, e.v0, e.cfg);
        }
        return v;
    }
    velocity(t = now()) {
        const events = this.ev;
        const n = events.length;
        if (n === 0)
            return 0;
        let v = 0;
        for (let i = 0; i < n; i += 1) {
            const e = events[i];
            const dt = t - e.t;
            // vel(dt <= 0) is exactly v0, without touching Math.exp.
            v += dt <= 0 ? e.v0 : vel(dt, e.x0, e.v0, e.cfg);
        }
        return v;
    }
    /** Drops springs whose remaining envelope is under 1e-3; returns how many still move. */
    prune(t = now()) {
        const events = this.ev;
        const n = events.length;
        if (n === 0)
            return 0;
        // In-place compaction: same keep/drop predicate as the old filter, no new array.
        let kept = 0;
        for (let i = 0; i < n; i += 1) {
            const e = events[i];
            const age = t - e.t;
            // Future events are always kept; also skips Math.exp for dt < 0.
            if (age < 0) {
                if (kept !== i)
                    events[kept] = e;
                kept += 1;
                continue;
            }
            const w = e.cfg.w;
            const wAge = w * age;
            if (Math.exp(-wAge) * (1 + wAge) * (Math.abs(e.x0) + Math.abs(e.v0) / w) > 1e-3) {
                if (kept !== i)
                    events[kept] = e;
                kept += 1;
            }
        }
        if (kept !== n)
            events.length = kept;
        return kept;
    }
    get moving() {
        return this.ev.length > 0;
    }
}
const KINDS = ['feedback', 'entrance', 'ambient'];
let override = null;
/** Lets an app supply its own pause / reduced-motion switch. Call setMotionState(null) to restore defaults. */
export function setMotionState(fn) {
    override = fn;
    sync();
}
let reducedList;
/** One cached media query list instead of a matchMedia call per job per frame. */
export function reducedQuery() {
    if (reducedList === undefined)
        reducedList = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    return reducedList;
}
export function state() {
    const hasDom = typeof document !== 'undefined';
    const root = hasDom ? document.documentElement.dataset : null;
    /* data-motion="full" overrides the OS setting, as in tokens.css; "reduced" forces it on. */
    const reduced = root?.motion === 'full' ? false : reducedQuery()?.matches === true || root?.reducedMotion === 'true' || root?.motion === 'reduced';
    const base = {
        paused: false,
        reduced,
        hidden: hasDom && document.hidden,
    };
    return override ? { ...base, ...override() } : base;
}
export function onscreen(el) {
    if (!el || typeof innerHeight === 'undefined')
        return true;
    const r = el.getBoundingClientRect();
    return r.width + r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
}
export function allowed(kind = 'feedback', el) {
    if (!KINDS.includes(kind))
        throw new TypeError(`Unknown motion kind: ${kind}`);
    return allowedWith(state(), kind, el);
}
/* Per-job check against an already-read MotionState. Same predicate as allowed():
   callers hoist one state() read per frame pass instead of one per job per frame.
   The kind guard is repeated so tick()/sync() keep the throw for unknown kinds. */
function allowedWith(s, kind, el) {
    if (!KINDS.includes(kind))
        throw new TypeError(`Unknown motion kind: ${kind}`);
    if (s.reduced || s.hidden)
        return false;
    if (s.paused && kind !== 'feedback')
        return false;
    return el ? onscreen(el) : true;
}
/** The preset a helper should use: paused feedback still shows, on the fastest spring. */
export const config = (kind, cfg = S.base) => (state().paused && kind === 'feedback' ? S.snap : cfg);
const jobs = new Set();
let raf = null;
let listening = false;
function settle(job) {
    jobs.delete(job);
    try {
        job.finish?.();
    }
    catch (error) {
        console.error(error);
    }
}
function tick() {
    raf = null;
    const t = now();
    // One motion-state read per frame pass: document/override polling is O(1), not O(jobs).
    // Per-job onscreen(el) checks still run inside allowedWith; jobs carry no el today.
    const s = state();
    // Snapshot: a step may add or cancel jobs, and new jobs wait for the next frame.
    for (const job of [...jobs]) {
        if (!jobs.has(job))
            continue;
        if (!allowedWith(s, job.kind ?? 'feedback')) {
            settle(job);
            continue;
        }
        let moving = false;
        try {
            moving = job.step(t) === true;
        }
        catch (error) {
            console.error(error);
        }
        if (!moving && jobs.has(job))
            settle(job);
    }
    if (jobs.size && raf === null)
        raf = requestAnimationFrame(tick);
}
/** When the motion state changes, running springs that are no longer allowed jump to their end state. */
export function sync() {
    // Snapshot: a finishing job may flip the motion state and run() an allowed
    // replacement, which lands in the live Set mid-pass. The pre-pass gate must
    // never settle jobs created by this pass, so new jobs wait for the next pass.
    const s = state();
    for (const job of [...jobs]) {
        if (!jobs.has(job))
            continue;
        if (!allowedWith(s, job.kind ?? 'feedback'))
            settle(job);
    }
    if (!jobs.size && raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
    }
}
/* Process-lifetime singleton on purpose: one motion:change + one visibilitychange + one media
   listener serves every job, added once on first run() and never removed. Deliberately no
   unlisten export: removing them while jobs run would strand springs on a stale gate, and
   re-adding per run would churn listeners. No per-instance accumulation: run() adds no
   listeners itself, it only flips `listening`. */
function listen() {
    if (listening || typeof document === 'undefined')
        return;
    listening = true;
    document.addEventListener('motion:change', sync);
    document.addEventListener('visibilitychange', sync);
    reducedQuery()?.addEventListener('change', sync);
}
const noop = () => { };
/** Schedules a job and returns cancel(), which finishes it at once. Disallowed jobs finish immediately. */
export function run(step, opts = {}) {
    const job = typeof step === 'function' ? { step, kind: opts.kind ?? 'feedback', finish: opts.finish } : { ...step, kind: step.kind ?? 'feedback' };
    if (!allowed(job.kind) || typeof requestAnimationFrame !== 'function') {
        settle(job);
        return noop;
    }
    listen();
    jobs.add(job);
    if (raf === null)
        raf = requestAnimationFrame(tick);
    return () => {
        if (jobs.has(job))
            settle(job);
        // Finishing the last job also releases the already-requested browser callback.
        if (!jobs.size && raf !== null) {
            cancelAnimationFrame(raf);
            raf = null;
        }
    };
}
export const active = () => jobs.size;
