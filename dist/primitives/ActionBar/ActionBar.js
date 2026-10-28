// src/primitives/ActionBar/ActionBar.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* ActionBar. A toolbar for a row of action buttons under a post: one tab stop, arrow keys move between buttons. The host owns the buttons. */
import { useEffect, useRef } from 'react';
import { enabledIn, roveFocus, roveIndex } from '../../react/index.js';
const ITEMS = 'button';
/** Index a horizontal toolbar moves to for a key, or null when the key does nothing. Wraps at both ends. */
export function actionBarIndex(key, current, count) {
    return roveIndex(key, current, count, { orientation: 'horizontal', loop: true });
}
export function ActionBar({ className, slotProps, label, children, size = 'md', align = 'start' }) {
    const ref = useRef(null);
    const active = useRef(0);
    const sync = () => {
        const items = enabledIn(ref.current, ITEMS);
        const at = Math.min(active.current, items.length - 1);
        items.forEach((el, i) => el.setAttribute('tabindex', i === at ? '0' : '-1'));
    };
    useEffect(sync);
    return (_jsx("div", { ref: ref, role: "toolbar", "aria-label": label, "aria-orientation": "horizontal", "data-size": size, "data-align": align, className: "cieo cieo-action-bar", onFocus: (e) => {
            const items = enabledIn(ref.current, ITEMS);
            const i = items.findIndex((el) => el === e.target || el.contains(e.target));
            if (i >= 0) {
                active.current = i;
                sync();
            }
        }, onKeyDown: (e) => {
            if (e.defaultPrevented)
                return;
            roveFocus(e, ref.current, ITEMS, { orientation: 'horizontal', loop: true });
        }, ...customizePart(slotProps?.root, "cieo cieo-action-bar", undefined, className), children: children }));
}
