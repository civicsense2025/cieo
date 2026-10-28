// src/primitives/ChatSystemMessage/ChatSystemMessage.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function ChatSystemMessage({ className, slotProps, children }) {
    return (_jsx("p", { className: "cieo cieo-chat-system-message", ...customizePart(slotProps?.root, "cieo cieo-chat-system-message", undefined, className), children: children }));
}
