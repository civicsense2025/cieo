// src/primitives/LayoutHeader/LayoutHeader.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function LayoutHeader({ label, children }) {
    return (_jsx("header", { "aria-label": label, className: "cieo cieo-layout-header", children: children }));
}
