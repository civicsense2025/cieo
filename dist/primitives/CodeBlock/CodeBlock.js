// src/primitives/CodeBlock/CodeBlock.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function CodeBlock({ language, children }) {
    return (_jsx("pre", { ...(language ? { 'data-language': language } : {}), className: "cieo cieo-p-code-block", children: _jsx("code", { children: children }) }));
}
