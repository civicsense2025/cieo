// src/primitives/NavHeadingMenu/NavHeadingMenu.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function NavHeadingMenu({ label, children }) {
    return (_jsxs("section", { "aria-label": label, className: "cieo cieo-nav-heading-menu", children: [_jsx("h2", { children: label }), children] }));
}
