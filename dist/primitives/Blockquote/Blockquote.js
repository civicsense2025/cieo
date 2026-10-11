// src/primitives/Blockquote/Blockquote.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Blockquote({ cite, children }) {
    return (_jsxs("blockquote", { className: "cieo cieo-p-blockquote", children: [children, cite ? (_jsx("footer", { children: _jsx("cite", { children: cite }) })) : null] }));
}
