// src/primitives/StackItem/StackItem.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function StackItem({ grow = false, children }) {
    return (_jsx("div", { "data-grow": grow, className: "cieo cieo-stack-item", children: children }));
}
