// src/primitives/AvatarStatusDot/AvatarStatusDot.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function AvatarStatusDot({ className, slotProps, status = 'default', children }) {
    return (_jsxs("span", { className: "cieo cieo-p-avatar-status-dot-wrap", ...customizePart(slotProps?.root, "cieo cieo-p-avatar-status-dot-wrap", undefined, className), children: [children, _jsx("span", { "aria-hidden": "true", "data-status": status, className: "cieo-p-avatar-status-dot", ...customizePart(slotProps?.dot, "cieo-p-avatar-status-dot", undefined) })] }));
}
