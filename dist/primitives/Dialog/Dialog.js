// src/primitives/Dialog/Dialog.tsx
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Overlay } from '../Overlay/Overlay.js';
export function Dialog({ label, open, onClose, children }) {
    if (!open)
        return null;
    const onKeyDown = (e) => {
        if (e.key === 'Escape')
            onClose?.();
    };
    return (_jsxs(_Fragment, { children: [_jsx(Overlay, {}), _jsx("div", { role: "dialog", "aria-modal": "true", "aria-label": label, onKeyDown: onKeyDown, className: "cieo cieo-dialog", children: children })] }));
}
