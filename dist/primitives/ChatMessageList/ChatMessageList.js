// src/primitives/ChatMessageList/ChatMessageList.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function ChatMessageList({ label = 'Messages', children }) {
    return (_jsx("div", { role: "log", "aria-label": label, className: "cieo cieo-chat-message-list", children: children }));
}
