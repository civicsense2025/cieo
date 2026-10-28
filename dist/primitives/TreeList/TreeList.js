'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function TreeList({ className, slotProps, depth = 0, children }) {
    return (_jsx("ul", { "data-depth": depth, className: "cieo cieo-tree-list", ...customizePart(slotProps?.root, "cieo cieo-tree-list", undefined, className), children: children }));
}
