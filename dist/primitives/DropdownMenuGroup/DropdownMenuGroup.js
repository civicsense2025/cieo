// src/primitives/DropdownMenuGroup/DropdownMenuGroup.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function DropdownMenuGroup({ label, children }) {
    return (_jsxs("div", { role: "group", "aria-label": label, className: "cieo cieo-dropdown-menu-group", children: [label ? _jsx("span", { className: "cieo-dropdown-menu-group-label", children: label }) : null, children] }));
}
