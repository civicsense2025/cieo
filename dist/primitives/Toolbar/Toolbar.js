'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* Toolbar. Horizontal action bar with optional title. Arrow, Home and End keys move focus between its controls. */
import { useRef } from 'react';
import { roveFocus } from '../../react/index.js';
const CONTROLS = 'button,[href],input,select,textarea,[role="button"],[tabindex="0"]';
export function Toolbar({ className, slotProps, label, title, children }) {
    const ref = useRef(null);
    const onKeyDown = (e) => {
        if (e.target.matches?.('input,select,textarea'))
            return;
        roveFocus(e, ref.current, CONTROLS, { orientation: 'horizontal' });
    };
    return (_jsxs("div", { ref: ref, role: "toolbar", "aria-label": label, onKeyDown: onKeyDown, className: "cieo cieo-toolbar", ...customizePart(slotProps?.root, "cieo cieo-toolbar", undefined, className), children: [title ? _jsx("span", { className: "cieo-toolbar-title", ...customizePart(slotProps?.title, "cieo-toolbar-title"), children: title }) : null, _jsx("span", { className: "cieo-toolbar-actions", ...customizePart(slotProps?.actions, "cieo-toolbar-actions"), children: children })] }));
}
