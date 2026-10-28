// src/primitives/Token/Token.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function Token({ className, slotProps, tone = 'default', children }) {
    return (_jsx("span", { "data-tone": tone, className: "cieo cieo-p-token", ...customizePart(slotProps?.root, "cieo cieo-p-token", undefined, className), children: children }));
}
