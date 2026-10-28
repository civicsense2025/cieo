// src/primitives/CharacterCountRing/CharacterCountRing.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* CharacterCountRing. Ring that fills as a text limit is used. Host owns the text and the limit; this owns the math, the countdown and the tone. */
import { useRef } from 'react';
import { useSpring } from '../../react/index.js';
import { customizePart } from '../customization.js';
const whole = (n) => (Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0);
/** Pure ring state. Bad input (NaN, negatives) clamps to an empty ring; a limit of 0 or less is always full and over. */
export function ringState(length, max, warnAt = 20) {
    const used = whole(length);
    const limit = whole(max);
    const remaining = limit - used;
    const fraction = limit === 0 ? 1 : Math.min(1, used / limit);
    const warn = Number.isFinite(warnAt) ? Math.max(0, warnAt) : 20;
    const tone = remaining < 0 ? 'danger' : remaining <= warn ? 'warning' : 'normal';
    return { fraction, remaining, tone, showNumber: remaining <= warn };
}
/** Screen-reader sentence for the current count. */
export function ringAnnouncement(remaining) {
    if (remaining < 0) {
        const over = -remaining;
        return `${over} ${over === 1 ? 'character' : 'characters'} over the limit`;
    }
    return `${remaining} ${remaining === 1 ? 'character' : 'characters'} left`;
}
const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DISPLAY_FLOOR = -99;
export function CharacterCountRing({ className, slotProps, length, max, warnAt = 20 }) {
    const s = ringState(length, max, warnAt);
    const arc = useRef(null);
    /* The first value is frozen so React never rewrites the offset the spring is driving. */
    const first = useRef(CIRCUMFERENCE * (1 - s.fraction));
    useSpring(s.fraction, (v) => {
        if (arc.current)
            arc.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - v));
    }, { preset: 'soft' });
    return (_jsxs("span", { className: "cieo cieo-character-count-ring", "data-tone": s.tone, "data-grown": s.showNumber ? '' : undefined, ...customizePart(slotProps?.root, "cieo cieo-character-count-ring", undefined, className), children: [_jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: [_jsx("circle", { className: "cieo-character-count-ring-track", cx: "12", cy: "12", r: RADIUS, fill: "none", strokeWidth: "2", ...customizePart(slotProps?.track, "cieo-character-count-ring-track", undefined) }), _jsx("circle", { ref: arc, className: "cieo-character-count-ring-arc", cx: "12", cy: "12", r: RADIUS, fill: "none", strokeWidth: "2", strokeLinecap: "round", strokeDasharray: CIRCUMFERENCE, style: { strokeDashoffset: first.current }, transform: "rotate(-90 12 12)", ...customizePart(slotProps?.arc, "cieo-character-count-ring-arc", { strokeDashoffset: first.current }) })] }), s.showNumber ? (_jsx("span", { className: "cieo-character-count-ring-number", "aria-hidden": "true", ...customizePart(slotProps?.number, "cieo-character-count-ring-number", undefined), children: Math.max(DISPLAY_FLOOR, s.remaining) })) : null, _jsx("span", { className: "cieo-sr-only", children: ringAnnouncement(s.remaining) })] }));
}
