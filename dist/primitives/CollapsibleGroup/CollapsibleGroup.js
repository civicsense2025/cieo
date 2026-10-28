'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function CollapsibleGroup({ className, slotProps, label, children }) {
    return (_jsx("div", { role: "group", "aria-label": label, className: "cieo cieo-collapsible-group", ...customizePart(slotProps?.root, "cieo cieo-collapsible-group", undefined, className), children: children }));
}
