// src/primitives/SideNavHeading/SideNavHeading.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function SideNavHeading({ className, slotProps, children }) {
    return _jsx("h2", { className: "cieo cieo-side-nav-heading", ...customizePart(slotProps?.root, "cieo cieo-side-nav-heading", undefined, className), children: children });
}
