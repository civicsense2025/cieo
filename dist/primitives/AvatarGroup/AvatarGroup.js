'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function AvatarGroup({ people, max = 4, size = 'md', style }) {
    const shown = people.slice(0, max);
    const rest = people.length - shown.length;
    return (_jsxs("span", { "aria-hidden": "true", "data-size": size, className: "cieo cieo-avatar-group", style: style, children: [shown.map((p, i) => (_jsx("span", { className: "cieo-avatar", children: p.src ? _jsx("img", { src: p.src, alt: "", loading: "lazy" }) : _jsx("span", { className: "cieo-avatar-initials", children: p.initials }) }, `${p.name}-${i}`))), rest > 0 ? _jsxs("span", { className: "cieo-avatar cieo-avatar-overflow", children: ["+", rest] }) : null] }));
}
