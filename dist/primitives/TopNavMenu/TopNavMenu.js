// src/primitives/TopNavMenu/TopNavMenu.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function TopNavMenu({ className, slotProps, label, children }) {
    return (_jsx("div", { role: "group", "aria-label": label, className: "cieo cieo-top-nav-menu", ...customizePart(slotProps?.root, "cieo cieo-top-nav-menu", undefined, className), children: children }));
}
