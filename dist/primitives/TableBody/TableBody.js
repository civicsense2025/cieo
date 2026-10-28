'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function TableBody({ className, slotProps, children }) {
    return (_jsx("tbody", { className: "cieo cieo-table-body", ...customizePart(slotProps?.root, "cieo cieo-table-body", undefined, className), children: children }));
}
