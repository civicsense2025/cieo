// src/primitives/Card/Card.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Card({ title, children }) {
    return (_jsxs("section", { className: "cieo cieo-card", children: [title ? _jsx("h2", { children: title }) : null, children] }));
}
