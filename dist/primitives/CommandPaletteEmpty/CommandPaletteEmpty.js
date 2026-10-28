// src/primitives/CommandPaletteEmpty/CommandPaletteEmpty.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function CommandPaletteEmpty({ className, slotProps, children }) {
    return _jsx("p", { className: "cieo cieo-p-command-palette-empty", ...customizePart(slotProps?.root, "cieo cieo-p-command-palette-empty", undefined, className), children: children ?? 'No results' });
}
