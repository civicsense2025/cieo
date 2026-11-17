// src/primitives/ShareBar/ShareBar.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/** Fractions of the whole, or null when any share is missing, zero, negative or alone. */
export function shareFractions(values) {
    if (values.length < 2 || values.some((v) => !Number.isFinite(v) || v <= 0))
        return null;
    const total = values.reduce((a, b) => a + b, 0);
    return values.map((v) => v / total);
}
export function ShareBar({ className, slotProps, segments, label }) {
    const fractions = shareFractions(segments.map((s) => s.value));
    if (!fractions)
        return null;
    return (_jsx("div", { ...customizePart(slotProps?.root, "cieo cieo-p-share-bar", undefined, className), role: "img", "aria-label": label, children: segments.map((s, i) => _jsx("span", { style: { flexGrow: fractions[i], background: s.color } }, i)) }));
}
