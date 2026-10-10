// src/primitives/AvatarStatusDot/AvatarStatusDot.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function AvatarStatusDot({ status = 'default', children }) {
    return (_jsxs("span", { className: "cieo cieo-p-avatar-status-dot-wrap", children: [children, _jsx("span", { "aria-hidden": "true", "data-status": status, className: "cieo-p-avatar-status-dot" })] }));
}
