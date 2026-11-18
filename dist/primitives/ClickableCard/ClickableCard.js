// src/primitives/ClickableCard/ClickableCard.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Slot } from '../Slot/Slot.js';
import { customizePart } from '../customization.js';
export function ClickableCard({ children, className, slotProps, asChild = false, ref, style, ...rest }) {
    const customized = customizePart(slotProps?.root, 'cieo cieo-clickable-card', style, className);
    if (asChild) {
        return (_jsx(Slot, { asChild: true, ref: ref, ...rest, className: "cieo cieo-clickable-card", style: style, ...customized, children: children }));
    }
    return (_jsx("article", { ref: ref, ...rest, className: "cieo cieo-clickable-card", style: style, ...customized, children: children }));
}
