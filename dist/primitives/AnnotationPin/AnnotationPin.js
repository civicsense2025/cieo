// src/primitives/AnnotationPin/AnnotationPin.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/** Accessible name: "Comment 3, open" or "Comment 3 by Ava, resolved". Index is clamped to a whole number of at least 1. */
export function annotationPinLabel(index, state = 'open', author) {
    const n = Number.isFinite(index) ? Math.max(1, Math.floor(index)) : 1;
    const by = author && author.trim() ? ` by ${author.trim()}` : '';
    return `Comment ${n}${by}, ${state}`;
}
/** Clamps a layer coordinate to 0..1; NaN becomes 0. */
export function clampUnit(value) {
    if (!Number.isFinite(value))
        return 0;
    return Math.min(1, Math.max(0, value));
}
export function AnnotationPin({ index, x, y, state = 'open', selected = false, label, initials, onSelect }) {
    const n = Number.isFinite(index) ? Math.max(1, Math.floor(index)) : 1;
    return (_jsx("button", { type: "button", "aria-label": annotationPinLabel(n, state, label), "aria-pressed": selected, "data-state": state, "data-selected": selected ? 'true' : undefined, onClick: onSelect, style: { left: `${clampUnit(x) * 100}%`, top: `${clampUnit(y) * 100}%` }, className: "cieo cieo-annotation-pin", children: _jsx("span", { "aria-hidden": "true", className: "cieo-annotation-pin-body", children: _jsx("span", { className: "cieo-annotation-pin-text", children: initials && initials.trim() ? initials.trim().slice(0, 3) : n }) }) }));
}
