// src/primitives/ChatLayout/ChatLayout.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function ChatLayout({ children, rail, className, slotProps }) {
    return (_jsxs("div", { className: "cieo cieo-chat-layout", ...customizePart(slotProps?.root, "cieo cieo-chat-layout", undefined, className), children: [_jsx("div", { "data-pane": "transcript", ...customizePart(slotProps?.transcript, undefined, undefined), children: children }), rail ? _jsx("div", { "data-pane": "rail", ...customizePart(slotProps?.rail, undefined, undefined), children: rail }) : null] }));
}
