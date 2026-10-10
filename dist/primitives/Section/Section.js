// src/primitives/Section/Section.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Section({ title, label, children }) {
    return (_jsxs("section", { "aria-label": label, className: "cieo cieo-section", children: [title ? _jsx("h2", { className: "cieo-section-title", children: title }) : null, children] }));
}
