// src/primitives/TypingIndicator/TypingIndicator.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* TypingIndicator. Three waving dots plus a spoken sentence about who is typing. The host owns the names; this owns the wording, the wave and the enter/leave. */
import { useState } from 'react';
import { usePresence } from '../../react/index.js';
/** Sentence for who is typing: "" for nobody, "Ava is typing", "Ava and Ben are typing", "Ava, Ben and Cy are typing", "Ava and 3 others are typing". Blank names are ignored. */
export function typingLabel(names) {
    const list = names.map((n) => n.trim()).filter(Boolean);
    if (list.length === 0)
        return '';
    if (list.length === 1)
        return `${list[0]} is typing`;
    if (list.length === 2)
        return `${list[0]} and ${list[1]} are typing`;
    if (list.length === 3)
        return `${list[0]}, ${list[1]} and ${list[2]} are typing`;
    return `${list[0]} and ${list.length - 1} others are typing`;
}
/** Identity of the set of people typing, ignoring order and blanks. The spoken text changes only when this changes. */
export function typingSetKey(names) {
    return [...new Set(names.map((n) => n.trim()).filter(Boolean))].sort().join('\u0000');
}
export function TypingIndicator({ names, variant = 'bubble' }) {
    const open = typingSetKey(names) !== '';
    const key = typingSetKey(names);
    /* The held names keep the sentence stable while the indicator leaves, and keep it from changing when only the order changes. */
    const [held, setHeld] = useState({ key, names });
    if (open && held.key !== key)
        setHeld({ key, names });
    const { mounted, ref } = usePresence(open);
    const label = typingLabel(held.names);
    return (_jsx("span", { role: "status", "data-variant": variant, "data-empty": mounted ? undefined : '', className: "cieo cieo-typing-indicator", children: mounted ? (_jsxs("span", { ref: ref, className: "cieo-typing-indicator-body", children: [_jsxs("span", { "aria-hidden": "true", className: "cieo-typing-indicator-dots", children: [_jsx("span", { className: "cieo-typing-indicator-dot" }), _jsx("span", { className: "cieo-typing-indicator-dot" }), _jsx("span", { className: "cieo-typing-indicator-dot" })] }), _jsx("span", { className: variant === 'inline' ? 'cieo-typing-indicator-text' : 'cieo-sr-only', children: label })] })) : null }));
}
