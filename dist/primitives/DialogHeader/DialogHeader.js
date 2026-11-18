// src/primitives/DialogHeader/DialogHeader.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function DialogHeader({ className, slotProps, title, onClose, closeLabel = 'Close' }) {
    return (_jsxs("div", { className: "cieo cieo-dialog-header", ...customizePart(slotProps?.root, "cieo cieo-dialog-header", undefined, className), children: [_jsx("h2", { children: title }), onClose ? (_jsx("button", { type: "button", onClick: onClose, "aria-label": closeLabel, title: closeLabel, children: _jsx("svg", { viewBox: "0 0 20 20", width: "18", height: "18", "aria-hidden": "true", focusable: "false", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", children: _jsx("path", { d: "m5 5 10 10M15 5 5 15" }) }) })) : null] }));
}
