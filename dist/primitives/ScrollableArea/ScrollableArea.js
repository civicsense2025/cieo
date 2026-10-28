// src/primitives/ScrollableArea/ScrollableArea.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function ScrollableArea({ className, slotProps, orientation = 'vertical', maxHeight, children }) {
    return (_jsx("div", { "data-orientation": orientation, style: { maxHeight }, className: "cieo cieo-scrollable-area", ...customizePart(slotProps?.root, "cieo cieo-scrollable-area", { maxHeight }, className), children: children }));
}
