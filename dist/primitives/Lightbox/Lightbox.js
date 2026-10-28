'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
import { useDismiss, useModalFocus, usePresence } from '../../react/index.js';
import { Overlay } from '../Overlay/Overlay.js';
import { motionAttrs } from '../motion.js';
const ORIGINS = {
    fade: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
    rise: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
    scale: { x: 0, y: 0, scale: 0.96, opacity: 0, blur: 0 },
};
export function Lightbox({ src, alt, open, onClose, dismissOnOutsidePress = true, label = 'Image viewer', motion, entering = 'fade', exiting = 'fade', className, slotProps }) {
    const origin = entering === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : entering === 'fade' ? ORIGINS.fade : entering === 'scale' ? ORIGINS.scale : ORIGINS.rise;
    const { mounted, ref } = usePresence(open ?? false, { disabled: motion === false, from: origin });
    const onTab = useModalFocus(open ?? false, ref);
    useDismiss(open ?? false, () => onClose?.(), [ref], { outside: false });
    if (!mounted)
        return null;
    void exiting;
    return (_jsxs(_Fragment, { children: [_jsx(Overlay, { onPress: dismissOnOutsidePress ? onClose : undefined }), _jsxs("div", { ref: ref, role: "dialog", "aria-modal": "true", "aria-label": label, tabIndex: -1, onKeyDown: onTab, className: "cieo cieo-lightbox", ...motionAttrs({ motion, entering, exiting }), ...customizePart(slotProps?.root, "cieo cieo-lightbox", undefined, className), children: [_jsx("img", { src: src, alt: alt, ...customizePart(slotProps?.image, undefined, undefined) }), onClose ? (_jsx("button", { type: "button", onClick: onClose, "aria-label": "Close viewer", ...customizePart(slotProps?.close, undefined, undefined), children: "Close" })) : null] })] }));
}
