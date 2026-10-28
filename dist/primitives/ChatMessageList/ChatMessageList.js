// src/primitives/ChatMessageList/ChatMessageList.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function ChatMessageList({ label = 'Messages', children, className, slotProps }) {
    return (_jsx("div", { role: "log", "aria-label": label, className: "cieo cieo-chat-message-list", ...customizePart(slotProps?.root, "cieo cieo-chat-message-list", undefined, className), children: children }));
}
