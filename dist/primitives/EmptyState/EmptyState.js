// src/primitives/EmptyState/EmptyState.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function EmptyState({ title, description, children }) {
    return (_jsxs("div", { className: "cieo cieo-p-empty-state", children: [_jsx("h2", { className: "cieo-p-empty-state-title", children: title }), description ? _jsx("p", { className: "cieo-p-empty-state-description", children: description }) : null, _jsx("div", { className: "cieo-p-empty-state-action", children: children })] }));
}
