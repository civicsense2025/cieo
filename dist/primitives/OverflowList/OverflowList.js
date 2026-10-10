// src/primitives/OverflowList/OverflowList.tsx
'use client';
import { jsxs as _jsxs } from "react/jsx-runtime";
/* OverflowList. Generic +N overflow for nodes (AvatarGroup pattern). Renders the first max children plus a count; expansion is host-owned. */
import { Children } from 'react';
export function OverflowList({ max = 4, children }) {
    const all = Children.toArray(children);
    const shown = all.slice(0, max);
    const rest = all.length - shown.length;
    return (_jsxs("span", { className: "cieo cieo-p-overflow-list", children: [shown, rest > 0 ? _jsxs("span", { className: "cieo-p-overflow-list-more", children: ["+", rest] }) : null] }));
}
