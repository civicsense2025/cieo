'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useDismiss, useModalFocus, usePresence } from '../../react/index.js';
import { Overlay } from '../Overlay/Overlay.js';
import { motionAttrs } from '../motion.js';
const ORIGINS = {
    fade: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
    rise: { x: 0, y: 4, scale: 1, opacity: 0, blur: 0 },
    scale: { x: 0, y: 0, scale: 0.96, opacity: 0, blur: 0 },
};
export function BottomSheet({ label, open, onClose, dismissOnOutsidePress = true, children, motion, entering = 'rise', exiting = 'rise' }) {
    const origin = entering === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : entering === 'fade' ? ORIGINS.fade : entering === 'scale' ? ORIGINS.scale : ORIGINS.rise;
    const { mounted, ref } = usePresence(open ?? false, { disabled: motion === false, from: origin });
    const onTab = useModalFocus(open ?? false, ref);
    useDismiss(open ?? false, () => onClose?.(), [ref], { outside: false });
    if (!mounted)
        return null;
    void exiting;
    return (_jsxs(_Fragment, { children: [_jsx(Overlay, { onPress: dismissOnOutsidePress ? onClose : undefined }), _jsx("div", { ref: ref, role: "dialog", "aria-modal": "true", "aria-label": label, "data-side": "bottom", tabIndex: -1, onKeyDown: onTab, className: "cieo cieo-bottom-sheet", ...motionAttrs({ motion, entering, exiting }), children: children })] }));
}
