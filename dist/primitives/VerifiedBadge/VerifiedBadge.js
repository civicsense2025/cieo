// src/primitives/VerifiedBadge/VerifiedBadge.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Pixel-free size lookup: the CSS reads the data-size attribute, this keeps unknown input on the default. */
export function verifiedBadgeSize(size) {
    return size === 'sm' ? 'sm' : 'md';
}
export function VerifiedBadge({ label = 'Verified', size }) {
    return (_jsxs("svg", { className: "cieo cieo-verified-badge", "data-size": verifiedBadgeSize(size), role: "img", "aria-label": label, viewBox: "0 0 24 24", focusable: "false", children: [_jsx("title", { children: label }), _jsx("path", { className: "cieo-verified-badge-seal", d: "M12 1.8l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3-3.2-.1L12 22.2l-2.6-1.9-3.2.1-1-3-2.6-1.9 1-3.1-1-3.1 2.6-1.9 1-3 3.2.1z" }), _jsx("path", { className: "cieo-verified-badge-check", d: "M7.8 12.3l2.9 2.9 5.6-5.8", fill: "none" })] }));
}
