// src/primitives/BigNumber/BigNumber.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function BigNumber({ className, slotProps, value, label, layout = 'stacked' }) {
    return (_jsxs("p", { ...customizePart(slotProps?.root, "cieo cieo-p-big-number", undefined, className), "data-layout": layout, children: [_jsx("span", { className: "cieo-p-big-number__value", children: value }), label ? _jsx("span", { className: "cieo-p-big-number__label", children: label }) : null] }));
}
