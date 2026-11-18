// src/primitives/TopNavHeading/TopNavHeading.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Slot } from '../Slot/Slot.js';
import { customizePart } from '../customization.js';
export function TopNavHeading({ className, slotProps, href = '/', asChild = false, ref, style, children, ...rest }) {
    const customized = customizePart(slotProps?.root, 'cieo cieo-top-nav-heading', style, className);
    if (asChild) {
        return (_jsx(Slot, { asChild: true, ref: ref, ...rest, className: "cieo cieo-top-nav-heading", style: style, ...customized, children: children }));
    }
    return (_jsx("a", { ref: ref, ...rest, href: href, className: "cieo cieo-top-nav-heading", style: style, ...customized, children: children }));
}
