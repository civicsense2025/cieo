// src/primitives/ChatMessageMetadata/ChatMessageMetadata.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function ChatMessageMetadata({ className, slotProps, children }) {
    return (_jsx("p", { className: "cieo cieo-chat-message-metadata", ...customizePart(slotProps?.root, "cieo cieo-chat-message-metadata", undefined, className), children: children }));
}
