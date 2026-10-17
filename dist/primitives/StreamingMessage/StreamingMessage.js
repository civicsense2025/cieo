// src/primitives/StreamingMessage/StreamingMessage.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChatMessage } from '../ChatMessage/ChatMessage.js';
export function StreamingMessage({ message, author, time, truncatedText = 'Truncated' }) {
    return (_jsx(ChatMessage, { author: author, time: time, children: _jsxs("div", { className: "cieo cieo-p-streaming-message", "data-complete": message.complete ? 'true' : 'false', "aria-busy": message.complete ? undefined : true, children: [_jsx("p", { "data-text": true, children: message.text }), message.truncated ? _jsx("p", { "data-truncated": true, children: truncatedText }) : null] }) }));
}
