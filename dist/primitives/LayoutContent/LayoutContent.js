// src/primitives/LayoutContent/LayoutContent.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function LayoutContent({ className, slotProps, label, children }) {
    return (_jsx("main", { "aria-label": label, className: "cieo cieo-layout-content", ...customizePart(slotProps?.root, "cieo cieo-layout-content", undefined, className), children: children }));
}
