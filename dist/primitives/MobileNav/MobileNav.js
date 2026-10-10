// src/primitives/MobileNav/MobileNav.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function MobileNav({ label, open = false, onClose, children }) {
    if (!open)
        return null;
    return (_jsxs("div", { className: "cieo cieo-mobile-nav", children: [_jsx("nav", { "aria-label": label, children: children }), onClose ? (_jsx("button", { type: "button", "aria-label": "Close navigation", onClick: onClose, children: "Close" })) : null] }));
}
