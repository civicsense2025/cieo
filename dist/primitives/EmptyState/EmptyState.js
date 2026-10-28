// src/primitives/EmptyState/EmptyState.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function EmptyState({ className, slotProps, slots, title, description, children }) {
    return (_jsxs("div", { className: "cieo cieo-p-empty-state", ...customizePart(slotProps?.root, "cieo cieo-p-empty-state", undefined, className), children: [slots?.icon, _jsx("h2", { className: "cieo-p-empty-state-title", ...customizePart(slotProps?.title, "cieo-p-empty-state-title"), children: slots?.title ?? title }), description || slots?.description ? _jsx("p", { className: "cieo-p-empty-state-description", ...customizePart(slotProps?.description, "cieo-p-empty-state-description"), children: slots?.description ?? description }) : null, _jsx("div", { className: "cieo-p-empty-state-action", ...customizePart(slotProps?.action, "cieo-p-empty-state-action"), children: slots?.action ?? children })] }));
}
