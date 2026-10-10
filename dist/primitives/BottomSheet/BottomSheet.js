// src/primitives/BottomSheet/BottomSheet.tsx
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Overlay } from '../Overlay/Overlay.js';
export function BottomSheet({ label, open, onClose, children }) {
    if (!open)
        return null;
    const onKeyDown = (e) => {
        if (e.key === 'Escape')
            onClose?.();
    };
    return (_jsxs(_Fragment, { children: [_jsx(Overlay, {}), _jsx("div", { role: "dialog", "aria-modal": "true", "aria-label": label, "data-side": "bottom", onKeyDown: onKeyDown, className: "cieo cieo-bottom-sheet", children: children })] }));
}
