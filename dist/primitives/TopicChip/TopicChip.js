// src/primitives/TopicChip/TopicChip.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function TopicChip({ className, slotProps, dot, children }) {
    const ownedStyle = dot ? { '--cieo-topic-dot': dot } : undefined;
    return (_jsx("span", { className: "cieo cieo-p-topic-chip", style: ownedStyle, ...customizePart(slotProps?.root, "cieo cieo-p-topic-chip", ownedStyle, className), children: children }));
}
