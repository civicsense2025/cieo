// src/primitives/TopNav/TopNav.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function TopNav({ label = 'Primary', children }) {
    return (_jsx("header", { className: "cieo cieo-top-nav", children: _jsx("nav", { "aria-label": label, children: children }) }));
}
