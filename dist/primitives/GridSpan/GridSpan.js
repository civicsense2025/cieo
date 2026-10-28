// src/primitives/GridSpan/GridSpan.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function GridSpan({ className, slotProps, span, children }) {
    return (_jsx("div", { "data-span": span, className: "cieo cieo-grid-span", ...customizePart(slotProps?.root, "cieo cieo-grid-span", undefined, className), children: children }));
}
