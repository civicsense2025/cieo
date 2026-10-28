// src/primitives/CommandPaletteList/CommandPaletteList.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function CommandPaletteList({ className, slotProps, label, children }) {
    return (_jsx("div", { role: "listbox", "aria-label": label, className: "cieo cieo-p-command-palette-list", ...customizePart(slotProps?.root, "cieo cieo-p-command-palette-list", undefined, className), children: children }));
}
