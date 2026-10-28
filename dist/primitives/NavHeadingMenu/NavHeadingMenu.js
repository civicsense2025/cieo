// src/primitives/NavHeadingMenu/NavHeadingMenu.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function NavHeadingMenu({ className, slotProps, label, children }) {
    return (_jsxs("section", { "aria-label": label, className: "cieo cieo-nav-heading-menu", ...customizePart(slotProps?.root, "cieo cieo-nav-heading-menu", undefined, className), children: [_jsx("h2", { children: label }), children] }));
}
