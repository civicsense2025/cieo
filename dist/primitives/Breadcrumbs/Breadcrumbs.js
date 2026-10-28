'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function Breadcrumbs({ className, slotProps, label = 'Breadcrumb', children }) {
    return (_jsx("nav", { "aria-label": label, className: "cieo cieo-p-breadcrumbs", ...customizePart(slotProps?.root, "cieo cieo-p-breadcrumbs", undefined, className), children: _jsx("ol", { children: children }) }));
}
