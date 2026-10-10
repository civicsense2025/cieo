// src/primitives/LayoutPanel/LayoutPanel.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function LayoutPanel({ label, side = 'right', children }) {
    return (_jsx("aside", { "aria-label": label, "data-side": side, className: "cieo cieo-layout-panel", children: children }));
}
