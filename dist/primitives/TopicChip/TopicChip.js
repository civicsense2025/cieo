// src/primitives/TopicChip/TopicChip.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function TopicChip({ className, slotProps, dot, children }) {
    return (_jsx("span", { ...customizePart(slotProps?.root, "cieo cieo-p-topic-chip", undefined, className), style: dot ? { ['--cieo-topic-dot']: dot } : undefined, children: children }));
}
