'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* React SwapText, useSwap, and Digits components. Keyframes live in design/styles/primitives/motion.css
   (and cieo/controls.css), so strict CSP pages never need runtime <style> injection. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { digits } from '../dom/index.js';
import { useIso, useReducedMotion } from './hooks.js';
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
/** Text swap: the old value drifts up and fades out, then the new one fades in, in one grid cell so nothing reflows mid-swap. */
export function SwapText({ value, className, render }) {
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
