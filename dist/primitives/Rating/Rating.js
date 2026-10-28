// src/primitives/Rating/Rating.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* Rating. Star rating: a radio group the viewer can set, or a read-only summary. The host owns the value. */
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../react/index.js';
import { customizePart } from '../customization.js';
const MAX_RATING = 10;
function ratingMax(max) {
    const whole = Number.isFinite(max) ? Math.floor(max) : max > 0 ? MAX_RATING : 1;
    return Math.min(MAX_RATING, Math.max(1, whole || 1));
}
function ratingCount(count) {
    if (Number.isNaN(count))
        return 0;
    return Math.min(MAX_RATING, Math.max(0, Math.floor(count)));
}
/** Value a key moves to (1..max, clamped to 10), or null when the key does nothing or the value would not change. No wrapping. */
export function ratingKeyStep(key, value, max) {
    const top = ratingMax(max);
    const now = Number.isFinite(value) ? Math.min(top, Math.max(0, Math.round(value))) : 0;
    let next = null;
    if (key === 'ArrowRight' || key === 'ArrowUp')
        next = Math.min(top, now + 1);
    else if (key === 'ArrowLeft' || key === 'ArrowDown')
        next = Math.max(1, now - 1);
    else if (key === 'Home')
        next = 1;
    else if (key === 'End')
        next = top;
    return next === null || next === now ? null : next;
}
/** Spoken summary: "4 out of 5". Value clamps to 0..max (max is capped at 10); halves keep one decimal. */
export function ratingLabel(value, max) {
    const top = ratingMax(max);
    const v = Number.isFinite(value) ? Math.min(top, Math.max(0, value)) : 0;
    return `${Number.isInteger(v) ? v : v.toFixed(1)} out of ${top}`;
}
/** Start delays (ms) for stars from..to-1 popping in turn, capped at 10 entries; the last starts by `window`. */
export function ratingPopDelays(from, to, window = 150) {
    const n = Math.max(0, ratingCount(to) - ratingCount(from));
    if (n === 0)
        return [];
    const span = Number.isFinite(window) ? Math.max(0, window) : 150;
    const step = n === 1 ? 0 : Math.min(40, span / (n - 1));
    return Array.from({ length: n }, (_, i) => Math.round(i * step));
}
const STAR = 'M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z';
export function Rating({ className, slotProps, value, onChange, max = 5, label, readOnly, size = 'md' }) {
    const top = ratingMax(max);
    const safe = Number.isFinite(value) ? Math.min(top, Math.max(0, value)) : 0;
    const rounded = Math.round(safe);
    const reduced = useReducedMotion();
    const [hover, setHover] = useState(null);
    const group = useRef(null);
    const previous = useRef(rounded);
    useEffect(() => {
        const from = previous.current;
        previous.current = rounded;
        if (readOnly || reduced || rounded <= from)
            return;
        const stars = group.current?.querySelectorAll('[data-star]');
        const delays = ratingPopDelays(from, rounded);
        const runs = delays.map((delay, i) => {
            const el = stars?.[from + i];
            if (!el || typeof el.animate !== 'function')
                return null;
            return el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 280, delay, easing: 'cubic-bezier(.2,.15,.2,1)' });
        });
        return () => runs.forEach((r) => r?.cancel());
    }, [rounded, readOnly, reduced]);
    const shown = hover ?? safe;
    const stars = Array.from({ length: top }, (_, i) => {
        const filled = shown >= i + 1 - 0.0001;
        return (_jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", "data-star": "", "data-filled": filled ? '' : undefined, className: "cieo-rating-star", fill: filled ? 'currentColor' : 'none', stroke: "currentColor", strokeWidth: "1.6", strokeLinejoin: "round", ...customizePart(slotProps?.star, "cieo-rating-star", undefined), children: _jsx("path", { d: STAR }) }, i));
    });
    if (readOnly) {
        return (_jsx("span", { ref: group, role: "img", "aria-label": ratingLabel(safe, top), ...{ 'aria-description': label }, "data-size": size, "data-readonly": "", className: "cieo cieo-rating", ...customizePart(slotProps?.root, "cieo cieo-rating", undefined, className), children: stars }));
    }
    const focusStar = (n) => group.current?.querySelectorAll('[role="radio"]')[n - 1]?.focus();
    return (_jsx("div", { ref: group, role: "radiogroup", "aria-label": label, "data-size": size, className: "cieo cieo-rating", onMouseLeave: () => setHover(null), onKeyDown: (e) => {
            if (e.key === ' ' || e.key === 'Spacebar') {
                const radio = e.target.closest('[role="radio"]');
                const selected = Number(radio?.dataset.value);
                if (!radio || !Number.isFinite(selected))
                    return;
                e.preventDefault();
                onChange?.(selected);
                radio.focus({ preventScroll: true });
                return;
            }
            const next = ratingKeyStep(e.key, rounded, top);
            if (next === null)
                return;
            e.preventDefault();
            onChange?.(next);
            focusStar(next);
        }, ...customizePart(slotProps?.root, "cieo cieo-rating", undefined, className), children: Array.from({ length: top }, (_, i) => {
            const n = i + 1;
            return (_jsx("span", { role: "radio", "data-value": n, "aria-checked": rounded === n, "aria-label": `${n} ${n === 1 ? 'star' : 'stars'}`, tabIndex: rounded === n || (rounded === 0 && n === 1) ? 0 : -1, className: "cieo-rating-radio", onClick: () => onChange?.(n), onMouseEnter: () => setHover(n), ...customizePart(slotProps?.radio, "cieo-rating-radio", undefined), children: stars[i] }, n));
        }) }));
}
