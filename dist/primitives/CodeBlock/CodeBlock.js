// src/primitives/CodeBlock/CodeBlock.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function CodeBlock({ className, slotProps, language, children }) {
    return (_jsx("pre", { ...(language ? { 'data-language': language } : {}), className: "cieo cieo-p-code-block", ...customizePart(slotProps?.root, "cieo cieo-p-code-block", undefined, className), children: _jsx("code", { ...customizePart(slotProps?.code), children: children }) }));
}
