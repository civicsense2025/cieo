'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* React bindings: thin hooks over the spring core and DOM helpers. They write to the DOM directly while
   something moves, so a spring never re-renders the component tree per frame. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { S, Track, allowed, config, now, run, state } from '../core/spring.js';
import { digits, edges, enter, exit, flip, swap } from '../dom/index.js';
const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const cfgOf = (p) => (typeof p === 'string' ? S[p] : p);
/** True while the user (or the app, via data-motion="reduced") asks for reduced motion. */
export function useReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const update = () => setReduced(state().reduced);
        update();
        const media = matchMedia('(prefers-reduced-motion: reduce)');
        const observer = new MutationObserver(update);
        media.addEventListener('change', update);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion', 'data-reduced-motion'] });
        document.addEventListener('motion:change', update);
        return () => {
            media.removeEventListener('change', update);
            observer.disconnect();
            document.removeEventListener('motion:change', update);
        };
    }, []);
    return reduced;
}
/** Follows `target` with a critically damped spring and hands each frame to onFrame without re-rendering. Reduced motion jumps. */
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
    }, [target, kind, cfg.w]);
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
/** Holds the outgoing value while it exits; reduced motion skips the exit, and a timer clears it if no animation event arrives. */
export function useSwap(value, fallbackMs = 700) {
    const reduced = useReducedMotion();
    const [s, setS] = useState({ shown: value, leaving: null, key: 0 });
    if (!Object.is(s.shown, value))
        setS({ shown: value, leaving: reduced ? null : s.shown, key: s.key + 1 });
    const done = useCallback((key) => setS((p) => (p.key === key && p.leaving !== null ? { ...p, leaving: null } : p)), []);
    useEffect(() => {
        if (s.leaving === null)
            return;
        const id = setTimeout(() => done(s.key), fallbackMs);
        return () => clearTimeout(id);
    }, [s.leaving, s.key, done, fallbackMs]);
    return { ...s, done };
}
const SWAP_CSS = `.cieo-swap{display:inline-grid;vertical-align:baseline}.cieo-swap>*{grid-area:1/1}
.cieo-swap-out{pointer-events:none;animation:cieo-out var(--motion-duration-exit,100ms) cubic-bezier(.4,0,1,1) both}
.cieo-swap-in[data-swap]{animation:cieo-in var(--motion-duration-base,300ms) var(--motion-ease-spring,cubic-bezier(.2,.15,.2,1)) var(--motion-duration-exit,100ms) both}
@keyframes cieo-out{to{opacity:0;transform:translateY(calc(var(--motion-drift,4px)*-1))}}
@keyframes cieo-in{from{opacity:0;transform:translateY(var(--motion-drift,4px))}}
@media (prefers-reduced-motion:reduce){.cieo-swap-out,.cieo-swap-in[data-swap]{animation-duration:0s;animation-delay:0s}}`;
let swapCss = false;
function ensureSwapCss() {
    if (swapCss || typeof document === 'undefined')
        return;
    swapCss = true;
    const el = document.createElement('style');
    el.setAttribute('data-cieo', 'swap');
    el.textContent = SWAP_CSS;
    document.head.appendChild(el);
}
/** Text swap: the old value drifts up and fades out, then the new one fades in, in one grid cell so nothing reflows mid-swap. */
export function SwapText({ value, className, render }) {
    useIso(ensureSwapCss, []);
    const { shown, leaving, key, done } = useSwap(value);
    const draw = render ?? ((v) => v);
    const onEnd = (e) => {
        if (e.target === e.currentTarget)
            done(key);
    };
    return (_jsxs("span", { className: className ? `cieo-swap ${className}` : 'cieo-swap', children: [leaving !== null ? (_jsx("span", { className: "cieo-swap-out", "aria-hidden": "true", children: draw(leaving) }, `o${key}`)) : null, _jsx("span", { className: "cieo-swap-in", "data-swap": leaving !== null ? '' : undefined, onAnimationEnd: onEnd, children: draw(shown) }, `i${key}`)] }));
}
/** Rolling number: only changed digits roll, in the direction of change. The first render is instant. */
export function Digits({ value, className, kind }) {
    const ref = useRef(null);
    const initial = useRef(String(value));
    const first = useRef(true);
    useIso(() => {
        if (!ref.current)
            return;
        if (first.current) {
            first.current = false;
            return;
        }
        return digits(ref.current, value, { kind });
    }, [value]);
    return (_jsx("span", { ref: ref, className: className, style: { fontVariantNumeric: 'tabular-nums' }, children: initial.current }));
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
        last.current = { left: r.left, right: r.right };
        if (prev && !opts?.disabled)
            return edges(el, prev, undefined);
    }, [key]);
}
/** FLIP reflow: children of `container` slide from where they were to where they are after a render that changed `key`. */
export function useFlip(container, key, opts) {
    const snapshot = useRef(null);
    const committed = useRef(key);
    /* Measure only when this render carries a new key, and always replace an older snapshot. */
    if (typeof window !== 'undefined' && container.current && !Object.is(committed.current, key)) {
        snapshot.current = new Map([...container.current.children].map((el) => [el, el.getBoundingClientRect()]));
    }
    useIso(() => {
        committed.current = key;
        const el = container.current;
        const before = snapshot.current;
        snapshot.current = null;
        if (!el || !before)
            return;
        return flip(el, () => { }, { ...opts, before });
    }, [key]);
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
    /* No cleanup per change: enter and exit retarget the element's one presence spring, so reversing is continuous. */
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
export { S, EXIT, LAG, ARRIVE, Track, allowed, now, resp, prog, setMotionState } from '../core/spring.js';
