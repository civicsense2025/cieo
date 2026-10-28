// src/primitives/Banner/Banner.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function Banner({ className, slotProps, tone = 'info', title, children }) {
    return (_jsxs("div", { role: "status", "data-tone": tone, className: "cieo cieo-p-banner", ...customizePart(slotProps?.root, "cieo cieo-p-banner", undefined, className), children: [title ? _jsx("p", { className: "cieo-p-banner-title", ...customizePart(slotProps?.title, "cieo-p-banner-title"), children: title }) : null, _jsx("div", { className: "cieo-p-banner-body", ...customizePart(slotProps?.body, "cieo-p-banner-body"), children: children })] }));
}
