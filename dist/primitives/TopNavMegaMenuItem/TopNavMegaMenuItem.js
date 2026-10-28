// src/primitives/TopNavMegaMenuItem/TopNavMegaMenuItem.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function TopNavMegaMenuItem({ className, slotProps, href, title, description }) {
    return (_jsxs("a", { href: href, className: "cieo cieo-top-nav-mega-menu-item", ...customizePart(slotProps?.root, "cieo cieo-top-nav-mega-menu-item", undefined, className), children: [_jsx("span", { className: "cieo-top-nav-mega-menu-item-title", ...customizePart(slotProps?.title, "cieo-top-nav-mega-menu-item-title", undefined), children: title }), description ? _jsx("span", { className: "cieo-top-nav-mega-menu-item-description", ...customizePart(slotProps?.description, "cieo-top-nav-mega-menu-item-description", undefined), children: description }) : null] }));
}
