// src/primitives/MobileNavToggle/MobileNavToggle.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function MobileNavToggle({ className, slotProps, expanded, onToggle, label = 'Open navigation' }) {
    return (_jsx("button", { type: "button", "aria-expanded": expanded, "aria-label": label, onClick: onToggle, className: "cieo cieo-mobile-nav-toggle", ...customizePart(slotProps?.root, "cieo cieo-mobile-nav-toggle", undefined, className), children: label }));
}
