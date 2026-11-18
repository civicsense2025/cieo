/* Motion gating and single-rAF job scheduler.
   'feedback' = a user-initiated state change, 'entrance' = page or section entrances,
   'ambient' = idle decoration. Reduced motion or a hidden page: nothing animates. Pause: only
   feedback animates, on the snap preset. Offscreen elements never animate. */
import { S, now } from './spring.js';
const KINDS = ['feedback', 'entrance', 'ambient'];
let override = null;
/** Lets an app supply its own pause / reduced-motion switch. Call setMotionState(null) to restore defaults. */
export function setMotionState(fn) {
    override = fn;
    sync();
}
let reducedList = null;
let cachedMatchMedia;
/** One cached media query list instead of a matchMedia call per job per frame. */
export function reducedQuery() {
    if (typeof matchMedia !== 'function')
        return null;
    if (!reducedList || cachedMatchMedia !== matchMedia) {
        cachedMatchMedia = matchMedia;
        reducedList = matchMedia('(prefers-reduced-motion: reduce)');
    }
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
/** Every attribute that turns motion down for a subtree below <html>: the component prop (motion={false} →
    data-motion="off"), a host-level reduced preference, and the legacy flag. JS springs honour all three; the
    page-level form on <html> is read by state(), so setMotionState() can still override it. */
export const REDUCED_SUBTREE = '[data-motion="off"], [data-motion="reduced"], [data-reduced-motion="true"]';
/** True when el sits inside a subtree whose motion is off or reduced. A descendant cannot opt back in. */
export function subtreeReduced(el) {
    const hit = !!el && typeof el.closest === 'function' ? el.closest(REDUCED_SUBTREE) : null;
    return hit !== null && (typeof document === 'undefined' || hit !== document.documentElement);
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
    if (!el)
        return true;
    // A host can reduce motion for one subtree (a dialog with its own preference); a descendant cannot opt back in.
    if (subtreeReduced(el))
        return false;
    return onscreen(el);
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
        if (!jobs.size && raf !== null) {
            cancelAnimationFrame(raf);
            raf = null;
        }
    };
}
export const active = () => jobs.size;
