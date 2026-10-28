'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function Table({ label, children, className, slotProps }) {
    return (_jsx("table", { "aria-label": label, className: "cieo cieo-table", ...customizePart(slotProps?.root, "cieo cieo-table", undefined, className), children: children }));
}
