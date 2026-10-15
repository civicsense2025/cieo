/* DOM helpers on the spring core. Each returns cancel(), which ends the motion at its final state.
   When motion is not allowed a helper applies the final state at once. Only transform, opacity,
   filter and clip-path move; inline styles a helper touched are restored exactly when it finishes,
   and will-change is set only while something moves. */
import { ARRIVE, EXIT, LAG, S, STAGGER_MAX, Track, allowed, clamp, config, now, prog, run } from '../core/spring.js';
const PROPS = ['transform', 'transform-origin', 'opacity', 'filter', 'clip-path', 'visibility', 'will-change'];
export const owners = new WeakMap();
const noop = () => { };
const st = (el) => el.style;
export const list = (x) => typeof x === 'string' ? [...document.querySelectorAll(x)] : x instanceof Element ? [x] : [...(x || [])];
export const gapFor = (n, gap) => Math.min(gap || 0, STAGGER_MAX / Math.max(1, n - 1));
/* Paint coalescing + blur gating (default ON, no public API).
   - Per-element last-value cache: transform/opacity writes are skipped unless the new value moved
     beyond quantization epsilon since the last write (0.0005 opacity, 0.01px x/y, 0.0005 scale).
     Identity is always painted explicitly (1.000 / full translate+scale string / none), never
     cleared to '': under author stylesheets a cleared inline would let author opacity, transform
     or blur leak through mid-paint. hold() restores the saved inline state at completion only.
   - Blur writes are skipped unless blur moved across the 0.05 threshold. Blur is a paint effect
     (not composite) while will-change only covers transform,opacity, so it is gated: elements wider
     than ~800px or more than 8 elements animating concurrently fall back to opacity+transform only
     (blur forced to 0, still painted as none, without the filter will-change upgrade).
     Width is measured once per animation and cached (no per-frame layout reads).
   - will-change: hold() sets 'transform, opacity'; the first active blur write upgrades it to
     'transform, opacity, filter' for the rest of the animation. Settle restores the saved inline
     will-change via hold's release (removing it when we added it). */
let liveEls = 0;
const BLUR_WIDE_PX = 800;
const BLUR_MAX_ELS = 8;
const BLUR_EPS = 0.05;
const lastPaint = new WeakMap();
const wideCache = new WeakMap();
function blurOK(el) {
    if (liveEls > BLUR_MAX_ELS)
        return false;
    let w = wideCache.get(el);
    if (w === undefined) {
        try {
            w = el.offsetWidth || el.getBoundingClientRect().width;
        }
        catch {
            w = 0;
        }
        wideCache.set(el, w);
    }
    return w <= BLUR_WIDE_PX;
}
/** Saves the inline values this module may write and returns a function that puts them back. */
export function hold(el, moving = true) {
    const hadStyle = el.hasAttribute('style');
    const s = st(el);
    const saved = PROPS.map((p) => [p, s.getPropertyValue(p), s.getPropertyPriority(p)]);
    if (moving)
        s.willChange = 'transform, opacity';
    return () => {
        saved.forEach(([p, v, priority]) => (v ? s.setProperty(p, v, priority) : s.removeProperty(p)));
        if (!hadStyle && !el.getAttribute('style'))
            el.removeAttribute('style');
        /* Paint caches reflect inline values; the restore above invalidates them. */
        lastPaint.delete(el);
        wideCache.delete(el);
    };
}
/** One motion per element: claiming finishes any earlier motion on it first. */
export function animate(els, job) {
    els = [...new Set(els)];
    els.forEach((el) => owners.get(el)?.());
    const releases = els.map((el) => hold(el));
    liveEls += els.length;
    let finished = false;
    let stop = noop;
    const cancel = () => { stop(); done(); };
    const done = () => {
        if (finished)
            return;
        finished = true;
        liveEls = Math.max(0, liveEls - els.length);
        let failure;
        let failed = false;
        for (const release of releases) {
            try {
                release();
            }
            catch (error) {
                if (!failed) {
                    failed = true;
                    failure = error;
                }
            }
        }
        els.forEach((el) => {
            if (owners.get(el) === cancel)
                owners.delete(el);
        });
        try {
            job.finish?.();
        }
        catch (error) {
            if (!failed) {
                failed = true;
                failure = error;
            }
        }
        if (failed)
            throw failure;
    };
    // Ownership precedes run because reduced-motion completion can happen synchronously.
    els.forEach((el) => owners.set(el, cancel));
    try {
        job.step(now());
        if (!finished)
            stop = run({ kind: job.kind, step: job.step, finish: done });
    }
    catch (error) {
        try {
            done();
        }
        catch { /* Preserve the initiating failure after releasing the touched styles. */ }
        throw error;
    }
    return cancel;
}
export function paint(el, o, y = 0, blur = 0, x = 0, scale = 1) {
    const s = st(el);
    const oClear = o > 0.999;
    const tClear = Math.abs(x) < 0.01 && Math.abs(y) < 0.01 && Math.abs(scale - 1) < 0.0005;
    let b = blur;
    if (b > BLUR_EPS && !blurOK(el))
        b = 0;
    const fClear = b <= BLUR_EPS;
    const last = lastPaint.get(el);
    /* Identity paints explicitly: a cleared inline would let author stylesheets leak through. */
    const oStr = clamp(o).toFixed(3);
    const tStr = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(4)})`;
    if (!last) {
        s.opacity = oStr;
        s.transform = tStr;
        if (fClear) {
            s.filter = 'none';
        }
        else {
            s.filter = `blur(${b.toFixed(2)}px)`;
            s.willChange = 'transform, opacity, filter';
        }
        lastPaint.set(el, { o, x, y, sc: scale, b, oClear, tClear, fClear });
        return;
    }
    if (oClear !== last.oClear || Math.abs(o - last.o) >= 0.0005) {
        s.opacity = oStr;
        last.o = o;
        last.oClear = oClear;
    }
    if (tClear !== last.tClear || Math.abs(x - last.x) >= 0.01 || Math.abs(y - last.y) >= 0.01 || Math.abs(scale - last.sc) >= 0.0005) {
        s.transform = tStr;
        last.x = x;
        last.y = y;
        last.sc = scale;
        last.tClear = tClear;
    }
    if (fClear !== last.fClear || Math.abs(b - last.b) >= BLUR_EPS) {
        if (fClear) {
            s.filter = 'none';
        }
        else {
            s.filter = `blur(${b.toFixed(2)}px)`;
            s.willChange = 'transform, opacity, filter';
        }
        last.b = b;
        last.fClear = fClear;
    }
}
const paintFrom = (el, p, f) => {
    const q = 1 - p;
    paint(el, f.opacity + (1 - f.opacity) * p, f.y * q, f.blur * q, f.x * q, f.scale + (1 - f.scale) * p);
};
const presences = new WeakMap();
const prehidden = new WeakSet();
function presence(el, to, opts) {
    const kind = opts.kind || 'feedback';
    const from = { x: 0, y: 4, scale: 0.97, opacity: 0, blur: 0, ...opts.from };
    if (to)
        el.hidden = false;
    let rec = presences.get(el);
    if (!rec && to && el.style.opacity === '0')
        prehidden.add(el);
    const final = () => {
        /* An element pre-hidden with inline opacity:0 must not get that 0 restored once it has entered. */
        if (prehidden.delete(el) && to)
            ['opacity', 'transform', 'filter'].forEach((p) => el.style.removeProperty(p));
        if (!to) {
            if (opts.remove)
                el.remove();
            else
                el.hidden = true;
        }
        opts.done?.();
    };
    if (!rec && !allowed(kind, el)) {
        owners.get(el)?.();
        final();
        return noop;
    }
    if (!rec) {
        const r = { o: new Track(to ? 0 : 1), from, final, cancel: noop };
        presences.set(el, r);
        r.cancel = animate([el], {
            kind,
            step: (t) => {
                paintFrom(el, clamp(r.o.at(t)), r.from);
                return r.o.prune(t) > 0;
            },
            finish: () => {
                presences.delete(el);
                r.final();
            },
        });
        rec = r;
    }
    rec.from = from;
    rec.final = final;
    rec.o.set(to, config(kind, opts.cfg || (to ? S.base : S.snap)), now() + (opts.delay || 0));
    return rec.cancel;
}
export function enter(target, opts = {}) {
    const els = list(target);
    const gap = gapFor(els.length, opts.stagger);
    const cancels = els.map((el, i) => presence(el, 1, { ...opts, delay: (opts.delay || 0) + i * gap }));
    return () => cancels.forEach((c) => c());
}
export const exit = (el, opts = {}) => presence(el, 0, opts);
/** The old content leaves in EXIT (100 ms, ease-in), then the new content springs in. Never overlapping. */
export function swap(host, next, opts = {}) {
    const kind = opts.kind || 'feedback';
    const amp = opts.y ?? 4;
    const blur = opts.blur ?? 0;
    let placed = false;
    const put = () => {
        if (placed)
            return;
        placed = true;
        if (typeof next === 'string')
            host.textContent = next;
        else
            host.replaceChildren(next);
    };
    if (!allowed(kind, host)) {
        owners.get(host)?.();
        put();
        opts.done?.();
        return noop;
    }
    const t0 = now();
    const cfg = config(kind, opts.cfg || S.base);
    return animate([host], {
        kind,
        step(t) {
            if (t < t0 + EXIT) {
                const e = clamp((t - t0) / EXIT) ** 2;
                paint(host, 1 - e, -e * amp, e * blur);
                return true;
            }
            put();
            const p = clamp(prog(t, t0 + EXIT, cfg));
            paint(host, p, (1 - p) * amp, (1 - p) * blur);
            return 1 - p > 1e-3;
        },
        finish() {
            put();
            opts.done?.();
        },
    });
}
/* FLIP: measure children, apply the mutation, then spring each child from its old place to its new one.
   Newly shown children fade up in place from ARRIVE (never from 0). A child that would travel more than half
   its width or more than one 56 px row fades in place instead of sliding; so does one that would start outside
   opts.clip. Hidden or removed children simply go (call exit first to animate them). */
const ROW = 56;
export const longMove = (a, b) => Math.abs(a.left - b.left) > 0.5 * b.width || Math.abs(a.top - b.top) > ROW;
const inside = (r, c) => r.top >= c.top - 0.5 && r.bottom <= c.bottom + 0.5 && r.left >= c.left - 0.5 && r.right <= c.right + 0.5;
const inView = (r) => r.width + r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
export function flip(container, mutate, opts = {}) {
    const kind = opts.kind || 'feedback';
    if (!allowed(kind, container)) {
        mutate();
        opts.done?.();
        return noop;
    }
    const kids = [...container.children];
    kids.forEach((el) => owners.get(el)?.());
    /* Batch the reads: one contiguous pass for before rects (skipped when the caller measured), mutate, then one
       contiguous pass for after rects plus the optional clip. No DOM writes happen between the passes, so each pass
       costs at most one layout; longMove/inside/inView semantics below are unchanged. */
    const before = opts.before ?? new Map(kids.map((el) => [el, el.getBoundingClientRect()]));
    mutate();
    const afterKids = [...container.children];
    const after = afterKids.map((el) => el.getBoundingClientRect());
    const clip = opts.clip?.getBoundingClientRect();
    const arrive = opts.arrive ?? ARRIVE;
    const moves = [];
    for (let i = 0; i < afterKids.length; i += 1) {
        const el = afterKids[i];
        const a = after[i];
        const b = before.get(el);
        const was = !!b && b.width + b.height > 0;
        if (!(a.width + a.height) || !(inView(a) || (was && inView(b))))
            continue;
        const start = was ? new DOMRect(b.left, b.top, a.width, a.height) : null;
        const dist = was ? Math.abs(b.left - a.left) + Math.abs(b.top - a.top) : 0;
        if (!was || longMove(b, a) || (clip && start && !inside(start, clip))) {
            if (!was || dist >= 0.5)
                moves.push({ el, dx: 0, dy: opts.y ?? 4, o0: arrive });
        }
        else if (dist >= 0.5)
            moves.push({ el, dx: b.left - a.left, dy: b.top - a.top, o0: 1 });
    }
    if (!moves.length) {
        opts.done?.();
        return noop;
    }
    const cfg = config(kind, opts.cfg || S.base);
    const gap = gapFor(moves.length, opts.stagger);
    const t0 = now();
    moves.forEach((m, i) => {
        m.p = new Track(0).set(1, cfg, t0 + i * gap);
    });
    return animate(moves.map((m) => m.el), {
        kind,
        step(t) {
            let moving = false;
            for (const m of moves) {
                const p = clamp(m.p.at(t));
                const q = 1 - p;
                st(m.el).transform = `translate(${(m.dx * q).toFixed(2)}px, ${(m.dy * q).toFixed(2)}px)`;
                if (m.o0 < 1)
                    st(m.el).opacity = (m.o0 + (1 - m.o0) * p).toFixed(3);
                if (m.p.prune(t) > 0)
                    moving = true;
            }
            return moving;
        },
        finish: opts.done,
    });
}
/** Rolling number: changed characters leave in EXIT, then new ones spring in from the direction of change. Ends as plain text. */
export function digits(el, value, opts = {}) {
    const kind = opts.kind || 'feedback';
    const next = String(value);
    owners.get(el)?.();
    const prev = el.textContent ?? '';
    if (prev === next) {
        opts.done?.();
        return noop;
    }
    if (!allowed(kind, el)) {
        el.textContent = next;
        opts.done?.();
        return noop;
    }
    const dir = opts.dir ?? (parseFloat(next) < parseFloat(prev) ? -1 : 1);
    const amp = (opts.y ?? 8) * dir;
    const width = Math.max(prev.length, next.length);
    const a = prev.padStart(width);
    const b = next.padStart(width);
    const slots = [];
    el.textContent = '';
    for (let i = 0; i < width; i += 1) {
        if (a[i] === b[i]) {
            if (b[i] !== ' ')
                el.append(b[i]);
            continue;
        }
        const slot = document.createElement('span');
        const fresh = document.createElement('span');
        const old = document.createElement('span');
        slot.style.cssText = 'display:inline-block;position:relative';
        fresh.style.display = 'inline-block';
        fresh.textContent = b[i] === ' ' ? '' : b[i];
        old.style.cssText = 'display:inline-block;position:absolute;left:0;top:0';
        old.textContent = a[i];
        old.setAttribute('aria-hidden', 'true');
        slot.append(fresh, old);
        el.append(slot);
        slots.push({ fresh, old });
    }
    const t0 = now();
    const cfg = config(kind, opts.cfg || S.base);
    /* amp/cfg/t0 hoisted; no layout reads in the per-frame loop (paint caches width once).
       Ends as plain text; old slots stay aria-hidden. The old halves get one terminal zero-opacity
       paint on the first frame past EXIT before their writes stop, so no stale mid-EXIT value lingers. */
    let oldDone = false;
    return animate([el], {
        kind,
        step(t) {
            const after = t >= t0 + EXIT;
            const e = after ? 1 : clamp((t - t0) / EXIT) ** 2;
            const p = clamp(prog(t, t0 + EXIT, cfg));
            const fq = (1 - p) * amp;
            if (!after) {
                const eo = -e * amp;
                const oo = 1 - e;
                for (const s of slots)
                    paint(s.old, oo, eo);
            }
            else if (!oldDone) {
                oldDone = true;
                for (const s of slots)
                    paint(s.old, 0, -amp);
            }
            for (const s of slots)
                paint(s.fresh, p, fq);
            return t < t0 + EXIT || 1 - p > 1e-3;
        },
        finish() {
            el.textContent = next;
            opts.done?.();
        },
    });
}
const span = (x) => (x instanceof Element ? x.getBoundingClientRect() : x);
/** An indicator already laid out at its new place springs from an old span; the leading edge moves first, the trailing edge LAG later. */
export function edges(el, from, to, opts = {}) {
    const kind = opts.kind || 'feedback';
    /* No layout reads when motion is off; still claim the element so an in-flight motion cannot keep writing to it. */
    if (!allowed(kind, el)) {
        owners.get(el)?.();
        opts.done?.();
        return noop;
    }
    const A = span(from);
    owners.get(el)?.();
    const B = span(to ?? el);
    if (Math.abs(A.left - B.left) + Math.abs(A.right - B.right) < 0.5) {
        opts.done?.();
        return noop;
    }
    const cfg = config(kind, opts.cfg || S.base);
    const t0 = now();
    const right = B.left >= A.left;
    const W = Math.max(1, B.right - B.left);
    const lo = new Track(A.left);
    const hi = new Track(A.right);
    (right ? hi : lo).set(right ? B.right : B.left, cfg, t0);
    (right ? lo : hi).set(right ? B.left : B.right, cfg, t0 + (opts.lag ?? LAG));
    return animate([el], {
        kind,
        step(t) {
            const l = lo.at(t);
            const r = hi.at(t);
            st(el).transformOrigin = '0 50%';
            st(el).transform = `translateX(${(l - B.left).toFixed(2)}px) scaleX(${((r - l) / W).toFixed(4)})`;
            return lo.prune(t) + hi.prune(t) > 0;
        },
        finish: opts.done,
    });
}
/* track: spring one value on an element and keep it as that element's state. x, y (px), scale and opacity
   compose into transform/opacity and are removed at identity; a custom property such as '--open' keeps its value.
   Per-frame cost: no array spreads or literal-array .map/.some per frame (for..of only); transform/opacity and
   each custom property are rewritten only when moved beyond quantization epsilon, so settled tails and idle
   props cost no style writes or toFixed allocs. The first owned draw and the settle draw always write:
   the identity-initialized cache is no evidence the DOM already agrees. */
const IDENTITY = { x: 0, y: 0, scale: 1, opacity: 1 };
const tracked = new WeakMap();
export function track(el, prop, value, opts = {}) {
    const kind = opts.kind || 'feedback';
    const custom = prop.startsWith('--');
    if (!custom && !(prop in IDENTITY))
        throw new TypeError(`track cannot move ${prop}`);
    let rec = tracked.get(el);
    if (!rec) {
        /* fresh: the numeric cache is not DOM evidence. The first owned draw and the terminal
           settle draw write unconditionally, so pre-existing inline values are actually cleared. */
        rec = { tracks: new Map(), job: null, fresh: true, lx: 0, ly: 0, ls: 1, lo: 1, ltClear: true, loClear: true, lc: new Map() };
        tracked.set(el, rec);
    }
    const r = rec;
    if (!r.tracks.has(prop))
        r.tracks.set(prop, new Track(custom ? value : IDENTITY[prop]));
    const draw = (t, force = false) => {
        const first = force || r.fresh;
        const tx = r.tracks.get('x');
        const ty = r.tracks.get('y');
        const ts = r.tracks.get('scale');
        const to = r.tracks.get('opacity');
        const x = tx ? tx.at(t) : 0;
        const y = ty ? ty.at(t) : 0;
        const s = ts ? ts.at(t) : 1;
        const o = to ? to.at(t) : 1;
        if (tx !== undefined || ty !== undefined || ts !== undefined) {
            const tClear = !(x || y || s !== 1);
            if (first || tClear !== r.ltClear || Math.abs(x - r.lx) >= 0.01 || Math.abs(y - r.ly) >= 0.01 || Math.abs(s - r.ls) >= 0.0005) {
                st(el).transform = tClear ? '' : `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;
                r.lx = x;
                r.ly = y;
                r.ls = s;
                r.ltClear = tClear;
            }
        }
        if (to !== undefined) {
            const oClear = o === 1;
            if (first || oClear !== r.loClear || Math.abs(o - r.lo) >= 0.0005) {
                st(el).opacity = oClear ? '' : clamp(o).toFixed(3);
                r.lo = o;
                r.loClear = oClear;
            }
        }
        for (const entry of r.tracks) {
            const k = entry[0];
            if (k.charCodeAt(0) !== 45 || !k.startsWith('--'))
                continue;
            const cv = entry[1].at(t);
            const prev = r.lc.get(k);
            if (prev === undefined || Math.abs(cv - prev) >= 0.00005) {
                st(el).setProperty(k, String(+cv.toFixed(4)));
                r.lc.set(k, cv);
            }
        }
        r.fresh = false;
    };
    const settle = () => {
        r.tracks.forEach((tr) => tr.jump(tr.target));
        draw(now(), true);
        st(el).removeProperty('will-change');
        if (r.job && owners.get(el) === r.job)
            owners.delete(el);
        r.job = null;
        if (!el.getAttribute('style'))
            el.removeAttribute('style');
    };
    if (!allowed(kind, el)) {
        r.job?.();
        r.tracks.get(prop).jump(value);
        settle();
        return noop;
    }
    /* config() resolved once per retarget (hoisted out of the per-frame step). */
    r.tracks.get(prop).set(value, config(kind, opts.cfg || S.base));
    if (!r.job) {
        owners.get(el)?.();
        st(el).willChange = 'transform, opacity';
        r.job = run({ kind, step: (t) => {
                draw(t);
                let moving = false;
                for (const tr of r.tracks.values())
                    if (tr.prune(t) > 0)
                        moving = true;
                return moving;
            }, finish: settle });
        owners.set(el, r.job);
    }
    return r.job || noop;
}
export { reveal, revealNow, scrollTo } from './scroll.js';
