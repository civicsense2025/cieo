// src/primitives/CommandPaletteEmpty/CommandPaletteEmpty.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function CommandPaletteEmpty({ children }) {
    return _jsx("p", { className: "cieo cieo-p-command-palette-empty", children: children ?? 'No results' });
}
