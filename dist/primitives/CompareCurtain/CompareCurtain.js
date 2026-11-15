'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* CompareCurtain. Before/after compare with a slider-role divider. The divider follows the pointer one to one
   from the inline-start edge in both directions; keyboard (arrows, PageUp/PageDown, Home/End with APG RTL
   arrows) and programmatic moves settle on the soft spring. Reduced motion jumps. */
import { useEffect, useRef } from 'react';
import { useSpring } from '../../react/index.js';
import { motionAttrs } from '../motion.js';
const clamp = (p) => Math.min(100, Math.max(0, Number.isFinite(p) ? p : 0));
/** Pointer fraction from the inline-start edge, so dragging toward inline-start reduces the value in both directions. */
export function curtainFraction(clientX, left, right, rtl) {
    const width = right - left;
    if (width <= 0)
        return 0;
    return rtl ? (right - clientX) / width : (clientX - left) / width;
}
/** Keyboard move in points for a key; 'min'/'max' for Home/End, null when unhandled. Arrows follow APG direction: in RTL, ArrowRight decreases. */
export function curtainKeyMove(key, step, largeStep, rtl) {
    const fwd = (d) => (rtl ? -d : d);
    if (key === 'ArrowRight' || key === 'ArrowUp')
        return fwd(step);
    if (key === 'ArrowLeft' || key === 'ArrowDown')
        return fwd(-step);
    if (key === 'PageUp')
        return largeStep;
    if (key === 'PageDown')
        return -largeStep;
    if (key === 'Home')
        return 'min';
    if (key === 'End')
        return 'max';
    return null;
}
export function CompareCurtain({ className, slotProps, label, valueText, before, after, position, onMove, step = 4, largeStep, motion, entering, exiting }) {
    const clamped = clamp(position);
    const large = largeStep ?? step * 10;
    const clipRef = useRef(null);
    const dividerRef = useRef(null);
    const dragging = useRef(false);
    const live = useRef(true);
    const rtlRef = useRef(false);
    function syncDir(el) {
        if (el && typeof getComputedStyle === 'function')
            rtlRef.current = getComputedStyle(el).direction === 'rtl';
    }
    function paint(p) {
        const c = clamp(p);
        if (clipRef.current)
            clipRef.current.style.clipPath = rtlRef.current ? `inset(0 0 0 ${(100 - c).toFixed(2)}%)` : `inset(0 ${(100 - c).toFixed(2)}% 0 0)`;
        if (dividerRef.current) {
            dividerRef.current.style.insetInlineStart = `${c.toFixed(2)}%`;
            dividerRef.current.setAttribute('aria-valuenow', String(Math.round(c)));
            dividerRef.current.setAttribute('aria-valuetext', `${Math.round(c)} percent ${valueText}`);
        }
    }
    useSpring(clamped, (v) => {
        if (live.current && !dragging.current)
            paint(v);
    }, { preset: 'soft' });
    useEffect(() => {
        live.current = motion !== false;
        syncDir(dividerRef.current);
        if (motion === false)
            paint(clamped);
    });
    function move(clientX) {
        const root = dividerRef.current?.parentElement;
        const bounds = root?.getBoundingClientRect();
        if (!bounds || bounds.width === 0)
            return;
        syncDir(root ?? null);
        const next = clamp(curtainFraction(clientX, bounds.left, bounds.right, rtlRef.current) * 100);
        paint(next);
        onMove?.(next);
    }
    function onPointerDown(e) {
        if (e.button !== 0)
            return;
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e) {
        if (dragging.current && e.currentTarget.hasPointerCapture(e.pointerId))
            move(e.clientX);
    }
    function endDrag(e) {
        if (!dragging.current)
            return;
        dragging.current = false;
        if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
        paint(clamped);
    }
    function onKeyDown(e) {
        syncDir(e.currentTarget);
        const moveBy = curtainKeyMove(e.key, step, large, rtlRef.current);
        if (moveBy === null)
            return;
        e.preventDefault();
        onMove?.(moveBy === 'min' ? 0 : moveBy === 'max' ? 100 : clamp(clamped + moveBy));
    }
    return (_jsxs("div", { className: "cieo cieo-compare", ...motionAttrs({ motion, entering, exiting }), ...customizePart(slotProps?.root, "cieo cieo-compare", undefined, className), children: [_jsx("div", { className: "cieo-compare-before", ...customizePart(slotProps?.before, "cieo-compare-before", undefined), children: before }), _jsx("div", { ref: clipRef, className: "cieo-compare-after", style: { clipPath: `inset(0 ${(100 - clamped).toFixed(2)}% 0 0)` }, ...customizePart(slotProps?.after, "cieo-compare-after", undefined), children: after }), _jsx("button", { ref: dividerRef, type: "button", role: "slider", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(clamped), "aria-valuetext": `${Math.round(clamped)} percent ${valueText}`, "aria-orientation": "horizontal", className: "cieo-compare-divider", style: { insetInlineStart: `${clamped.toFixed(2)}%` }, onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag, onKeyDown: onKeyDown, ...customizePart(slotProps?.divider, "cieo-compare-divider", undefined) })] }));
}
