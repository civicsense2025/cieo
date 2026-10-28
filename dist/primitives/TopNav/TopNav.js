// src/primitives/TopNav/TopNav.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function TopNav({ label = 'Primary', children, className, slotProps }) {
    return (_jsx("header", { className: "cieo cieo-top-nav", ...customizePart(slotProps?.root, "cieo cieo-top-nav", undefined, className), children: _jsx("nav", { "aria-label": label, ...customizePart(slotProps?.navigation, undefined, undefined), children: children }) }));
}
