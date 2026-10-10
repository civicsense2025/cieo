'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { usePresence } from '../../react/index.js';
import { Overlay } from '../Overlay/Overlay.js';
import { motionAttrs } from '../motion.js';
const ORIGINS = {
    fade: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
    rise: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
    scale: { x: 0, y: 0, scale: 0.96, opacity: 0, blur: 0 },
};
export function Lightbox({ src, alt, open, onClose, label = 'Image viewer', motion, entering = 'fade', exiting = 'fade' }) {
    const origin = entering === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : entering === 'fade' ? ORIGINS.fade : entering === 'scale' ? ORIGINS.scale : ORIGINS.rise;
    const { mounted, ref } = usePresence(open ?? false, { disabled: motion === false, from: origin });
    if (!mounted)
        return null;
    const onKeyDown = (e) => { if (e.key === 'Escape')
        onClose?.(); };
    void exiting;
    return (_jsxs(_Fragment, { children: [_jsx(Overlay, {}), _jsxs("div", { ref: ref, role: "dialog", "aria-modal": "true", "aria-label": label, onKeyDown: onKeyDown, className: "cieo cieo-lightbox", ...motionAttrs({ motion, entering, exiting }), children: [_jsx("img", { src: src, alt: alt }), onClose ? (_jsx("button", { type: "button", onClick: onClose, "aria-label": "Close viewer", children: "Close" })) : null] })] }));
}
