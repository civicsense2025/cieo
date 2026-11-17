// src/primitives/ReferenceText/ReferenceText.tsx
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/** Keeps a page count truthful: at least page 1, never past the total. */
export function pageBounds(page, total) {
    const t = Number.isFinite(total) ? Math.max(1, Math.floor(total)) : 1;
    const p = Number.isFinite(page) ? Math.min(Math.max(1, Math.floor(page)), t) : 1;
    return [p, t];
}
export function ReferenceText({ className, slotProps, spoken, children }) {
    // aria-label is not announced on a generic span, so the spoken form is hidden text beside the visible one.
    return (_jsx("span", { ...customizePart(slotProps?.root, "cieo cieo-p-reference-text", undefined, className), children: spoken ? _jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: children }), _jsx("span", { className: "cieo-sr-only", children: spoken })] }) : children }));
}
