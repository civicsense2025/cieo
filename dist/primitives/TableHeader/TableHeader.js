'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function TableHeader({ className, slotProps, children }) {
    return (_jsx("thead", { className: "cieo cieo-table-header", ...customizePart(slotProps?.root, "cieo cieo-table-header", undefined, className), children: children }));
}
