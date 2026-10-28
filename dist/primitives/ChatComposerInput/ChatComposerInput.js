// src/primitives/ChatComposerInput/ChatComposerInput.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function ChatComposerInput({ className, slotProps, label, value, onChange, rows = 1, placeholder }) {
    return (_jsx("textarea", { "aria-label": label, value: value, onChange: (e) => onChange?.(e.target.value), rows: rows, placeholder: placeholder, className: "cieo cieo-chat-composer-input", ...customizePart(slotProps?.root, "cieo cieo-chat-composer-input", undefined, className) }));
}
