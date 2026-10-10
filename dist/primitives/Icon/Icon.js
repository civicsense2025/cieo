// src/primitives/Icon/Icon.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function Icon({ label, size = 'md', children }) {
    if (label) {
        return (_jsx("span", { role: "img", "aria-label": label, "data-size": size, className: "cieo cieo-p-icon", children: children }));
    }
    return (_jsx("span", { "aria-hidden": "true", "data-size": size, className: "cieo cieo-p-icon", children: children }));
}
