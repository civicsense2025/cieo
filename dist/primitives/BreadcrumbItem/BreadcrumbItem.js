'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function BreadcrumbItem({ className, slotProps, current = false, children }) {
    return (_jsx("li", { "aria-current": current ? 'page' : undefined, className: "cieo-p-crumb", ...customizePart(slotProps?.root, "cieo-p-crumb", undefined, className), children: children }));
}
