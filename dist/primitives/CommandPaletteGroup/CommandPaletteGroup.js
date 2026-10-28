// src/primitives/CommandPaletteGroup/CommandPaletteGroup.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function CommandPaletteGroup({ className, slotProps, label, children }) {
    return (_jsxs("div", { role: "group", "aria-label": label, className: "cieo cieo-p-command-palette-group", ...customizePart(slotProps?.root, "cieo cieo-p-command-palette-group", undefined, className), children: [label ? _jsx("p", { className: "cieo-p-command-palette-group-label", ...customizePart(slotProps?.label, "cieo-p-command-palette-group-label", undefined), children: label }) : null, children] }));
}
