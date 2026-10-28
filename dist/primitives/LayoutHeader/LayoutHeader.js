// src/primitives/LayoutHeader/LayoutHeader.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function LayoutHeader({ className, slotProps, label, children }) {
    return (_jsx("header", { "aria-label": label, className: "cieo cieo-layout-header", ...customizePart(slotProps?.root, "cieo cieo-layout-header", undefined, className), children: children }));
}
