// src/primitives/Lightbox/Lightbox.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Overlay } from '../Overlay/Overlay.js';
export function Lightbox({ src, alt, open, onClose, label = 'Image viewer' }) {
    if (!open)
        return null;
    const onKeyDown = (e) => {
        if (e.key === 'Escape')
            onClose?.();
    };
    return (_jsxs(_Fragment, { children: [_jsx(Overlay, {}), _jsxs("div", { role: "dialog", "aria-modal": "true", "aria-label": label, onKeyDown: onKeyDown, className: "cieo cieo-lightbox", children: [_jsx("img", { src: src, alt: alt }), onClose ? (_jsx("button", { type: "button", onClick: onClose, "aria-label": "Close viewer", children: "Close" })) : null] })] }));
}
