'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function Stack({ className, slotProps, gap = 'md', children }) {
    return (_jsx("div", { "data-gap": gap, className: "cieo cieo-p-stack", ...customizePart(slotProps?.root, "cieo cieo-p-stack", undefined, className), children: children }));
}
