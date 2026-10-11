// src/primitives/Center/Center.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function Center({ maxWidth = '60rem', children }) {
    return (_jsx("div", { style: { maxWidth }, className: "cieo cieo-center", children: children }));
}
