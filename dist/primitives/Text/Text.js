'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function Text({ className, slotProps, as: Tag = 'p', size = 'default', children }) {
    return (_jsx(Tag, { "data-size": size, className: "cieo cieo-p-text", ...customizePart(slotProps?.root, "cieo cieo-p-text", undefined, className), children: children }));
}
