// src/primitives/QuotedText/QuotedText.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function QuotedText({ className, slotProps, reference, cite, children }) {
    return (_jsxs("figure", { ...customizePart(slotProps?.root, "cieo cieo-p-quoted-text", undefined, className), children: [reference ? _jsx("figcaption", { className: "cieo-p-quoted-text__ref", children: reference }) : null, _jsx("blockquote", { cite: cite, children: children })] }));
}
