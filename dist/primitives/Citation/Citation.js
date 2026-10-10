// src/primitives/Citation/Citation.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function Citation({ href, children }) {
    if (href) {
        return (_jsx("a", { href: href, className: "cieo cieo-p-citation-link", children: _jsx("cite", { className: "cieo cieo-p-citation", children: children }) }));
    }
    return _jsx("cite", { className: "cieo cieo-p-citation", children: children });
}
