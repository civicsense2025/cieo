// src/primitives/LegendItem/LegendItem.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function LegendItem({ className, slotProps, color, children }) {
    const ownedStyle = { '--cieo-legend': color };
    return (_jsx("span", { className: "cieo cieo-p-legend-item", style: ownedStyle, ...customizePart(slotProps?.root, "cieo cieo-p-legend-item", ownedStyle, className), children: children }));
}
