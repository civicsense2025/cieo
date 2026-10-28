// src/primitives/ClickableCard/ClickableCard.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function ClickableCard({ children, className, slotProps }) {
    return (_jsx("article", { className: "cieo cieo-clickable-card", ...customizePart(slotProps?.root, "cieo cieo-clickable-card", undefined, className), children: children }));
}
