'use client';
/* React spring, FLIP, edges, swap-effect, and presence hooks. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { S, Track, allowed, config, now, run, state } from '../core/spring.js';
import { edges, enter, exit, flip, swap } from '../dom/index.js';
export const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const cfgOf = (p) => (typeof p === 'string' ? S[p] : p);
/** True while the user (or the app, via data-motion="reduced") asks for reduced motion. */
const reducedSubs = new Set();
let reducedCached = null;
let reducedMedia = null;
let reducedObserver = null;
function updateReducedShared() {
    const next = state().reduced;
    if (next === reducedCached)
        return;
    reducedCached = next;
    [...reducedSubs].forEach((fn) => fn(next));
}
function subscribeReduced(fn) {
    reducedSubs.add(fn);
    if (reducedSubs.size === 1) {
        reducedCached = state().reduced;
        fn(reducedCached);
        reducedMedia = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
        reducedMedia?.addEventListener('change', updateReducedShared);
        reducedObserver = new MutationObserver(updateReducedShared);
        reducedObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion', 'data-reduced-motion'] });
        document.addEventListener('motion:change', updateReducedShared);
    }
    else if (reducedCached !== null) {
        fn(reducedCached);
    }
    return () => {
        reducedSubs.delete(fn);
        if (!reducedSubs.size) {
            reducedMedia?.removeEventListener('change', updateReducedShared);
            reducedObserver?.disconnect();
            document.removeEventListener('motion:change', updateReducedShared);
            reducedMedia = null;
            reducedObserver = null;
            reducedCached = null;
        }
    };
}
export function useReducedMotion() {
    const [reduced, setReduced] = useState(() => reducedCached ?? false);
    useEffect(() => subscribeReduced(setReduced), []);
    return reduced;
}
/** Follows `target` with a spring and hands each frame to onFrame without re-rendering. Reduced motion jumps. */
export function useSpring(target, onFrame, opts = {}) {
    const frame = useRef(onFrame);
    frame.current = onFrame;
    const settle = useRef(opts.onSettle);
    settle.current = opts.onSettle;
    const track = useRef(null);
    const cancel = useRef(null);
    const quiet = useRef(false);
    const kind = opts.kind ?? 'feedback';
    const cfg = cfgOf(opts.preset ?? 'base');
    const emit = (v, settled) => {
        if (quiet.current)
            return;
        frame.current(v);
        if (settled)
            settle.current?.(v);
    };
    useIso(() => {
        quiet.current = false;
        if (!track.current) {
            track.current = new Track(target);
            frame.current(target);
            return;
        }
        const tr = track.current;
        if (!allowed(kind)) {
            quiet.current = true;
            cancel.current?.();
            quiet.current = false;
            tr.jump(target);
            emit(target, true);
            return;
        }
        tr.set(target, config(kind, cfg), now());
        if (!cancel.current) {
            cancel.current = run({
                kind,
                step: (t) => {
                    emit(tr.at(t), false);
                    return tr.prune(t) > 0;
                },
                finish: () => {
                    cancel.current = null;
                    tr.jump(tr.target);
                    emit(tr.target, true);
                },
            });
        }
    }, [target, kind, cfg.w, cfg.z]);
    useEffect(() => () => {
        quiet.current = true;
        cancel.current?.();
    }, []);
}
/** Like useSpring but returns the value as state (re-renders per frame). Use for small, isolated readouts only. */
export function useSpringValue(target, opts = {}) {
    const [v, setV] = useState(target);
    useSpring(target, setV, opts);
    return v;
}
/** Text that swaps with the DOM helper whenever `value` changes (no wrapper markup left behind). */
export function useSwapEffect(ref, value, opts) {
    const first = useRef(true);
    useIso(() => {
        if (!ref.current)
            return;
        if (first.current) {
            first.current = false;
            ref.current.textContent = value;
            return;
        }
        return swap(ref.current, value, opts);
    }, [value]);
}
/** Sliding indicator: when `key` changes, the indicator springs from its old span with a leading and a lagging edge. */
export function useEdges(indicator, key, opts) {
    const last = useRef(null);
    useIso(() => {
        const el = indicator.current;
        if (!el)
            return;
        const r = el.getBoundingClientRect();
        const prev = last.current;
        last.current = { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        if (prev && !opts?.disabled)
            return edges(el, prev, undefined, { axis: opts?.axis });
    }, [key]);
}
function flipOffset(el) {
    const t = el.style?.transform || '';
    if (!t)
        return { x: 0, y: 0 };
    let m = /translate\(\s*(-?\d+(?:\.\d+)?)px\s*,\s*(-?\d+(?:\.\d+)?)px\s*\)/.exec(t);
    if (m)
        return { x: +m[1], y: +m[2] };
    m = /translateX\(\s*(-?\d+(?:\.\d+)?)px\s*\)/.exec(t);
    if (m)
        return { x: +m[1], y: 0 };
    m = /matrix\(\s*[^,]+,[^,]+,[^,]+,[^,]+,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/.exec(t);
    if (m)
        return { x: +m[1], y: +m[2] };
    return { x: 0, y: 0 };
}
/** FLIP reflow: children of `container` slide from where they were to where they are after a render that changed `key`. */
export function useFlip(container, key, opts) {
    const prev = useRef(null);
    const job = useRef(null);
    useIso(() => {
        const el = container.current;
        if (!el)
            return;
        const changed = !prev.current || !Object.is(prev.current.key, key);
        const stored = changed ? (prev.current?.rects ?? null) : null;
        const kids = [...el.children];
        let before = null;
        if (stored) {
            before = new Map();
            for (const kid of kids) {
                const b = stored.get(kid);
                if (!b)
                    continue;
                const o = flipOffset(kid);
                before.set(kid, o.x || o.y ? new DOMRect(b.left + o.x, b.top + o.y, b.width, b.height) : b);
            }
        }
        prev.current = {
            key,
            rects: new Map(kids.map((kid) => {
                const r = kid.getBoundingClientRect();
                const o = flipOffset(kid);
                return [kid, o.x || o.y ? new DOMRect(r.left - o.x, r.top - o.y, r.width, r.height) : r];
            })),
        };
        if (!before)
            return;
        job.current?.();
        job.current = null;
        job.current = flip(el, () => { }, { ...opts, before });
    }, [key]);
    useIso(() => () => {
        job.current?.();
        job.current = null;
    }, []);
}
/** Mount/unmount with a shared enter/exit spring. Returns whether to render and a ref for the element. */
export function usePresence(open, opts = {}) {
    const [mounted, setMounted] = useState(open);
    const ref = useRef(null);
    const cancel = useRef(null);
    if (opts.disabled) {
        if (mounted !== open)
            setMounted(open);
    }
    else if (open && !mounted)
        setMounted(true);
    useIso(() => {
        if (opts.disabled)
            return;
        const el = ref.current;
        if (!el)
            return;
        cancel.current = open ? enter(el, opts) : exit(el, { ...opts, done: () => setMounted(false) });
    }, [open, mounted]);
    useIso(() => () => cancel.current?.(), []);
    return { mounted, ref };
}
