// src/primitives/MobileNavToggle/MobileNavToggle.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function MobileNavToggle({ expanded, onToggle, label = 'Open navigation' }) {
    return (_jsx("button", { type: "button", "aria-expanded": expanded, "aria-label": label, onClick: onToggle, className: "cieo cieo-mobile-nav-toggle", children: label }));
}
