// src/primitives/ChatMessageBubble/ChatMessageBubble.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function ChatMessageBubble({ variant = 'incoming', children }) {
    return (_jsx("div", { "data-variant": variant, className: "cieo cieo-chat-message-bubble", children: children }));
}
