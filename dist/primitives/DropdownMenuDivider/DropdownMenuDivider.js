// src/primitives/DropdownMenuDivider/DropdownMenuDivider.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* DropdownMenuDivider. Visual split between menu clusters. Decorative only; never focusable. */
export function DropdownMenuDivider({ className, slotProps } = {}) {
    return (_jsx("div", { role: "separator", className: "cieo cieo-dropdown-menu-divider", ...customizePart(slotProps?.root, 'cieo cieo-dropdown-menu-divider', undefined, className) }));
}
