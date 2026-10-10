// src/primitives/DropdownMenuSubMenu/DropdownMenuSubMenu.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motionAttrs } from '../motion.js';
export function DropdownMenuSubMenu({ label, children, motion, entering = 'fade', exiting = 'fade' }) {
    return (_jsxs("div", { className: "cieo cieo-dropdown-menu-submenu", ...motionAttrs({ motion, entering, exiting }), children: [_jsx("button", { type: "button", "aria-label": label, className: "cieo-dropdown-menu-submenu-trigger", children: label }), _jsx("div", { role: "menu", "aria-label": label, className: "cieo-dropdown-menu-submenu-panel", children: children })] }));
}
