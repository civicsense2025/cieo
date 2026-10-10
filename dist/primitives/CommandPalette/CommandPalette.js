// src/primitives/CommandPalette/CommandPalette.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function CommandPalette({ label, query, children }) {
    return (_jsx("div", { role: "dialog", "aria-label": label, "data-query": query, className: "cieo cieo-p-command-palette", children: children }));
}
