// src/primitives/DropdownMenuSubMenu/DropdownMenuSubMenu.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function DropdownMenuSubMenu({ label, children }) {
    return (_jsxs("div", { className: "cieo cieo-dropdown-menu-submenu", children: [_jsx("button", { type: "button", "aria-label": label, className: "cieo-dropdown-menu-submenu-trigger", children: label }), _jsx("div", { role: "menu", "aria-label": label, className: "cieo-dropdown-menu-submenu-panel", children: children })] }));
}
