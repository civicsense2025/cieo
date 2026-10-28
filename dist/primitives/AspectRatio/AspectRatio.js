// src/primitives/AspectRatio/AspectRatio.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function AspectRatio({ className, slotProps, ratio, children }) {
    return (_jsx("div", { style: { aspectRatio: ratio }, className: "cieo cieo-aspect-ratio", ...customizePart(slotProps?.root, "cieo cieo-aspect-ratio", { aspectRatio: ratio }, className), children: children }));
}
