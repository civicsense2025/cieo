// src/primitives/ChatComposer/ChatComposer.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function ChatComposer({ label = 'Send a message', onSubmit, children }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.();
    };
    return (_jsx("form", { "aria-label": label, onSubmit: handleSubmit, className: "cieo cieo-chat-composer", children: children }));
}
