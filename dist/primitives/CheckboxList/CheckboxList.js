'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function CheckboxList({ className, slotProps, label, children }) {
    return (_jsx("div", { role: "group", "aria-label": label, className: "cieo cieo-p-checkbox-list", ...customizePart(slotProps?.root, "cieo cieo-p-checkbox-list", undefined, className), children: children }));
}
