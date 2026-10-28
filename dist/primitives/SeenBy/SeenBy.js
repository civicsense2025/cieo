// src/primitives/SeenBy/SeenBy.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* SeenBy. Tiny overlapping faces of the people who have read a message, with a "+n" for the rest. The host owns who has read; a new reader slides in. */
import { useRef } from 'react';
import { useFlip } from '../../react/index.js';
import { listNames } from '../GroupAvatar/GroupAvatar.js';
/** Spoken line for readers: "Seen by Ava", "Seen by Ava and Ben", "Seen by Ava, Ben and 2 others". Empty for nobody. */
export function seenByLabel(names) {
    const who = listNames(names);
    return who ? `Seen by ${who}` : '';
}
export function SeenBy({ className, slotProps, people, max = 3 }) {
    const ref = useRef(null);
    const limit = Math.max(1, Number.isFinite(max) ? Math.floor(max) : 3);
    const shown = people.slice(0, limit);
    const rest = people.length - shown.length;
    useFlip(ref, shown.map((p) => p.name).join('\u0000') + rest);
    if (people.length === 0)
        return null;
    const label = seenByLabel(people.map((p) => p.name));
    return (_jsxs("span", { title: label, className: "cieo cieo-seen-by", ...customizePart(slotProps?.root, "cieo cieo-seen-by", undefined, className), children: [_jsxs("span", { ref: ref, "aria-hidden": "true", className: "cieo-seen-by-stack", ...customizePart(slotProps?.stack, "cieo-seen-by-stack"), children: [shown.map((p) => (_jsx("span", { className: "cieo-seen-by-face", ...customizePart(slotProps?.face, "cieo-seen-by-face"), children: p.src ? _jsx("img", { src: p.src, alt: "", loading: "lazy" }) : _jsx("span", { className: "cieo-seen-by-initials", ...customizePart(slotProps?.initials, "cieo-seen-by-initials"), children: p.initials }) }, p.name))), rest > 0 ? (_jsxs("span", { className: "cieo-seen-by-face cieo-seen-by-more", ...customizePart(slotProps?.face, "cieo-seen-by-face cieo-seen-by-more"), children: ["+", rest] }, "more")) : null] }), _jsx("span", { className: "cieo-sr-only", children: label })] }));
}
