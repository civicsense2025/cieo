// src/primitives/NewItemsPill/NewItemsPill.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* NewItemsPill. A pill that drops in from the edge of a feed when new items arrive, rolls its count as more come, and leaves when there are none. The host owns the list and what "show" does. */
import { useEffect, useRef, useState } from 'react';
import { usePresence } from '../../react/index.js';
import { CompactCount } from '../CompactCount/CompactCount.js';
import { customizePart } from '../customization.js';
/** Default label: "1 new reply", "3 new replies". Bad counts read as zero. */
export function newItemsLabel(n) {
    const whole = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    return `${new Intl.NumberFormat('en').format(whole)} new ${whole === 1 ? 'reply' : 'replies'}`;
}
/** Whole, non-negative count; anything else is 0. */
export function clampNewItems(n) {
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}
/** What to announce: the label only when the pill first appears (0 to n), nothing on increments, and empty once it is gone. */
export function newItemsAnnouncement(prev, next, label) {
    if (prev === 0 && next > 0)
        return label(next);
    if (next === 0)
        return '';
    return null;
}
/** Splits a label into the number that rolls and the words after it. Labels that do not start with the exact number show whole, without a roll. */
export function splitNewItemsLabel(text, n) {
    const exact = new Intl.NumberFormat('en').format(clampNewItems(n));
    return text.startsWith(exact) ? { rolls: true, rest: text.slice(exact.length) } : { rolls: false, rest: text };
}
export function NewItemsPill({ className, slotProps, count, onShow, label = newItemsLabel, placement = 'top' }) {
    const n = clampNewItems(count);
    const edge = placement === 'bottom' ? 'bottom' : 'top';
    const last = useRef(n);
    if (n > 0)
        last.current = n;
    const { mounted, ref } = usePresence(n > 0, { from: { y: edge === 'top' ? -24 : 24, scale: 1, opacity: 0 } });
    const [message, setMessage] = useState('');
    const prev = useRef(0);
    useEffect(() => {
        const next = newItemsAnnouncement(prev.current, n, label);
        prev.current = n;
        if (next !== null)
            setMessage(next);
        // label is intentionally read at announce time, not a trigger.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [n]);
    const shown = n > 0 ? n : last.current;
    const split = splitNewItemsLabel(label(shown), shown);
    return (_jsxs("div", { className: "cieo cieo-new-items-pill", "data-placement": edge, ...customizePart(slotProps?.root, "cieo cieo-new-items-pill", undefined, className), children: [mounted ? (_jsxs("button", { ref: ref, type: "button", className: "cieo-new-items-pill-button", "aria-label": label(shown), onClick: onShow, ...customizePart(slotProps?.button, "cieo-new-items-pill-button", undefined), children: [_jsx("span", { "aria-hidden": "true", className: "cieo-new-items-pill-count", ...customizePart(slotProps?.count, "cieo-new-items-pill-count", undefined), children: split.rolls ? _jsx(CompactCount, { value: shown, hideZero: false }) : null }), _jsx("span", { "aria-hidden": "true", className: "cieo-new-items-pill-text", ...customizePart(slotProps?.text, "cieo-new-items-pill-text", undefined), children: split.rest })] })) : null, _jsx("span", { className: "cieo-sr-only", role: "status", "aria-live": "polite", "aria-atomic": "true", children: message })] }));
}
