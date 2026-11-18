'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* BottomSheet. Bottom-anchored dialog over a scrim with detents, drag-to-dismiss via PointerVelocityTracker, and controllable state. */
import { useEffect, useRef } from 'react';
import { S, Track, allowed, config, now, run } from '../../core/spring.js';
import { PointerVelocityTracker, projectToDetent, rubberBand } from '../../live/index.js';
import { useDismiss, useModalFocus, usePresence } from '../../react/index.js';
import { useControllableState } from '../../state/react.js';
import { Overlay } from '../Overlay/Overlay.js';
import { useCieoI18n } from '../I18nProvider/I18nProvider.js';
import { motionAttrs } from '../motion.js';
import { customizePart } from '../customization.js';
const ORIGINS = {
    fade: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
    rise: { x: 0, y: 4, scale: 1, opacity: 0, blur: 0 },
    scale: { x: 0, y: 0, scale: 0.96, opacity: 0, blur: 0 },
};
export function BottomSheet({ label, open: openProp, defaultOpen = false, onOpenChange, onClose: onCloseProp, dismissOnOutsidePress = true, detents, detent: detentProp, defaultDetent, onDetentChange, dragToDismiss = true, children, motion, entering = 'rise', exiting = 'rise', className, slotProps, }) {
    const [openState, setOpenState] = useControllableState({
        value: openProp,
        defaultValue: defaultOpen,
        onChange: onOpenChange,
    });
    const open = openProp !== undefined ? openProp : openState;
    const canClose = onCloseProp !== undefined || onOpenChange !== undefined || openProp === undefined;
    const onClose = canClose
        ? () => {
            setOpenState(false);
            onCloseProp?.();
        }
        : undefined;
    const { strings } = useCieoI18n();
    const sortedDetents = detents && detents.length > 0 ? [...new Set(detents)].sort((a, b) => a - b) : null;
    const positiveDetents = sortedDetents ? sortedDetents.filter((d) => d > 0) : [];
    const fallbackDetent = sortedDetents
        ? defaultDetent ?? (sortedDetents.length > 1 && sortedDetents[0] === 0 ? sortedDetents[1] : sortedDetents[sortedDetents.length - 1])
        : undefined;
    const [activeDetent, setActiveDetent] = useControllableState({
        value: detentProp,
        defaultValue: fallbackDetent,
        onChange: (next) => {
            if (next !== undefined)
                onDetentChange?.(next);
        },
    });
    const cycleDetent = () => {
        if (positiveDetents.length <= 1)
            return;
        const idx = activeDetent !== undefined ? positiveDetents.indexOf(activeDetent) : -1;
        setActiveDetent(positiveDetents[(idx + 1) % positiveDetents.length]);
    };
    const enterOrigin = entering === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : entering === 'fade' ? ORIGINS.fade : entering === 'scale' ? ORIGINS.scale : ORIGINS.rise;
    const exitOrigin = exiting === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : exiting === 'fade' ? ORIGINS.fade : exiting === 'scale' ? ORIGINS.scale : ORIGINS.rise;
    const origin = (open ?? false) ? enterOrigin : exitOrigin;
    const { mounted, ref } = usePresence(open ?? false, { disabled: motion === false, from: origin });
    const onTab = useModalFocus(open ?? false, ref);
    useDismiss(open ?? false, () => onClose?.(), [ref], { outside: false });
    const trackerRef = useRef(new PointerVelocityTracker());
    const offsetTrackRef = useRef(new Track(0, S.base));
    const cancelDragSpringRef = useRef(null);
    const dragSessionRef = useRef(null);
    useEffect(() => () => cancelDragSpringRef.current?.(), []);
    const applyOffset = (yPx) => {
        const el = ref.current;
        if (!el)
            return;
        el.style.transform = Math.abs(yPx) < 0.5 ? '' : `translateY(${yPx.toFixed(2)}px)`;
    };
    const onPointerDown = (e) => {
        if (!dragToDismiss || e.button !== 0)
            return;
        cancelDragSpringRef.current?.();
        cancelDragSpringRef.current = null;
        dragSessionRef.current = { id: e.pointerId, startY: e.clientY };
        trackerRef.current.reset();
        trackerRef.current.addSample(e.clientX, e.clientY, e.timeStamp);
        e.currentTarget.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e) => {
        const d = dragSessionRef.current;
        if (!d || d.id !== e.pointerId)
            return;
        trackerRef.current.addSample(e.clientX, e.clientY, e.timeStamp);
        const dy = e.clientY - d.startY;
        const mapped = dy < 0 ? rubberBand(dy, 120, 0.45) : dy;
        offsetTrackRef.current.jump(mapped);
        applyOffset(mapped);
    };
    const finishDrag = (e) => {
        const d = dragSessionRef.current;
        if (!d || d.id !== e.pointerId)
            return;
        dragSessionRef.current = null;
        trackerRef.current.addSample(e.clientX, e.clientY, e.timeStamp);
        e.currentTarget.releasePointerCapture?.(e.pointerId);
        const dy = offsetTrackRef.current.at(now());
        const vy = trackerRef.current.velocity().y;
        const vh = typeof window !== 'undefined' && window.innerHeight > 0 ? window.innerHeight : 800;
        if (sortedDetents && activeDetent !== undefined) {
            const draggedRatio = Math.max(0, Math.min(1, activeDetent - dy / vh));
            const snapped = projectToDetent(draggedRatio, -vy, sortedDetents, 450);
            if (snapped <= 0) {
                applyOffset(0);
                onClose?.();
                return;
            }
            setActiveDetent(snapped);
        }
        else if (dy > 96 || vy > 520) {
            applyOffset(0);
            onClose?.();
            return;
        }
        if (motion === false || !allowed('feedback', ref.current)) {
            offsetTrackRef.current.jump(0);
            applyOffset(0);
            return;
        }
        offsetTrackRef.current.release(dy, vy, 0, config('feedback', S.base), now());
        cancelDragSpringRef.current = run({
            kind: 'feedback',
            step: (t) => {
                applyOffset(offsetTrackRef.current.at(t));
                return offsetTrackRef.current.prune(t) > 0;
            },
            finish: () => {
                cancelDragSpringRef.current = null;
                offsetTrackRef.current.jump(0);
                applyOffset(0);
            },
        });
    };
    if (!mounted)
        return null;
    const detentStyle = activeDetent !== undefined && activeDetent > 0 ? { blockSize: `${(activeDetent * 100).toFixed(1)}vh`, maxBlockSize: '95vh' } : undefined;
    return (_jsxs(_Fragment, { children: [_jsx(Overlay, { onPress: dismissOnOutsidePress ? onClose : undefined }), _jsxs("div", { ref: ref, role: "dialog", "aria-modal": "true", "aria-label": label, "data-side": "bottom", "data-detent": activeDetent !== undefined ? String(activeDetent) : undefined, tabIndex: -1, onKeyDown: onTab, className: "cieo cieo-bottom-sheet", style: detentStyle, ...motionAttrs({ motion }), ...customizePart(slotProps?.root, 'cieo cieo-bottom-sheet', detentStyle, className), children: [positiveDetents.length > 1 ? (_jsx("button", { type: "button", "data-sheet-handle": "", "aria-label": strings.expandSheet, onClick: cycleDetent, onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerUp: finishDrag, onPointerCancel: finishDrag, ...customizePart(slotProps?.handle) })) : Boolean(sortedDetents) || (dragToDismiss && canClose) ? (_jsx("div", { "data-sheet-handle": "", "aria-hidden": "true", onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerUp: finishDrag, onPointerCancel: finishDrag, ...customizePart(slotProps?.handle) })) : null, children] })] }));
}
