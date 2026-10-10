// src/primitives/TopNavMegaMenuFeaturedCard/TopNavMegaMenuFeaturedCard.tsx
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
export function TopNavMegaMenuFeaturedCard({ title, description, href, children }) {
    const body = (_jsxs(_Fragment, { children: [children, _jsx("span", { className: "cieo-top-nav-mega-menu-featured-card-title", children: title }), description ? _jsx("span", { className: "cieo-top-nav-mega-menu-featured-card-description", children: description }) : null] }));
    if (href) {
        return (_jsx("a", { href: href, className: "cieo cieo-top-nav-mega-menu-featured-card", children: body }));
    }
    return _jsx("article", { className: "cieo cieo-top-nav-mega-menu-featured-card", children: body });
}
