// src/primitives/SectionHeader/SectionHeader.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function SectionHeader({ className, slotProps, title, level = 2, action }) {
    const Tag = `h${level}`;
    return (_jsxs("div", { ...customizePart(slotProps?.root, "cieo cieo-p-section-header", undefined, className), children: [_jsx(Tag, { children: title }), action ? _jsx("div", { className: "cieo-p-section-header__action", children: action }) : null] }));
}
