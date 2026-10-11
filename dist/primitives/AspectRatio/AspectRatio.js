// src/primitives/AspectRatio/AspectRatio.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function AspectRatio({ ratio, children }) {
    return (_jsx("div", { style: { aspectRatio: ratio }, className: "cieo cieo-aspect-ratio", children: children }));
}
