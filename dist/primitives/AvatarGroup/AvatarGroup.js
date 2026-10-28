'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function AvatarGroup({ className, slotProps, people, max = 4, size = 'md', label, style }) {
    const shown = people.slice(0, max);
    const rest = people.length - shown.length;
    return (_jsxs("span", { "data-size": size, className: "cieo cieo-avatar-group", style: style, ...customizePart(slotProps?.root, "cieo cieo-avatar-group", style, className), children: [_jsxs("span", { "aria-hidden": "true", className: "cieo-avatar-stack", ...customizePart(slotProps?.avatarStack, "cieo-avatar-stack"), children: [shown.map((p, i) => (_jsx("span", { className: "cieo-avatar", ...customizePart(slotProps?.avatar, "cieo-avatar"), children: p.src ? _jsx("img", { src: p.src, alt: "", loading: "lazy" }) : _jsx("span", { className: "cieo-avatar-initials", ...customizePart(slotProps?.avatarInitials, "cieo-avatar-initials"), children: p.initials }) }, `${p.name}-${i}`))), rest > 0 ? _jsxs("span", { className: "cieo-avatar cieo-avatar-overflow", ...customizePart(slotProps?.avatar, "cieo-avatar cieo-avatar-overflow"), children: ["+", rest] }) : null] }), label ? _jsx("span", { className: "cieo-avatar-group-label", ...customizePart(slotProps?.label, "cieo-avatar-group-label"), children: label }) : null] }));
}
