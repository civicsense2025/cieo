// src/primitives/AvatarGroupOverflow/AvatarGroupOverflow.tsx
'use client';
import { jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function AvatarGroupOverflow({ className, slotProps, count, size = 'md' }) {
    return (_jsxs("span", { "aria-hidden": "true", "data-size": size, className: "cieo cieo-p-avatar-group-overflow", ...customizePart(slotProps?.root, "cieo cieo-p-avatar-group-overflow", undefined, className), children: ["+", count] }));
}
