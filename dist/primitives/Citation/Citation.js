// src/primitives/Citation/Citation.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function Citation({ className, slotProps, href, children }) {
    if (href) {
        return (_jsx("a", { href: href, className: "cieo cieo-p-citation-link", ...customizePart(slotProps?.root, "cieo cieo-p-citation-link", undefined, className), children: _jsx("cite", { className: "cieo cieo-p-citation", ...customizePart(slotProps?.content, "cieo cieo-p-citation", undefined), children: children }) }));
    }
    return _jsx("cite", { className: "cieo cieo-p-citation", ...customizePart(slotProps?.root, "cieo cieo-p-citation", undefined, className), children: children });
}
