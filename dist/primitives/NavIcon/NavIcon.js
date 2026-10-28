// src/primitives/NavIcon/NavIcon.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function NavIcon({ className, slotProps, size = 'md', children }) {
    return (_jsx("span", { "aria-hidden": "true", "data-size": size, className: "cieo cieo-nav-icon", ...customizePart(slotProps?.root, "cieo cieo-nav-icon", undefined, className), children: children }));
}
