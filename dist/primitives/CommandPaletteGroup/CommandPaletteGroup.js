// src/primitives/CommandPaletteGroup/CommandPaletteGroup.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function CommandPaletteGroup({ label, children }) {
    return (_jsxs("div", { role: "group", "aria-label": label, className: "cieo cieo-p-command-palette-group", children: [label ? _jsx("p", { className: "cieo-p-command-palette-group-label", children: label }) : null, children] }));
}
