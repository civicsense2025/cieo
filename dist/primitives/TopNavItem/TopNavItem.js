// src/primitives/TopNavItem/TopNavItem.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function TopNavItem({ href, current = false, children }) {
    return (_jsx("a", { href: href, "aria-current": current ? 'page' : undefined, className: "cieo cieo-top-nav-item", children: children }));
}
