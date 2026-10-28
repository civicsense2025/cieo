// src/primitives/LayoutFooter/LayoutFooter.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function LayoutFooter({ className, slotProps, label, children }) {
    return (_jsx("footer", { "aria-label": label, className: "cieo cieo-layout-footer", ...customizePart(slotProps?.root, "cieo cieo-layout-footer", undefined, className), children: children }));
}
