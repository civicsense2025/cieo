'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* CompareCurtain. Before/after compare with a slider-role divider. The divider follows the pointer one to one;
   keyboard and programmatic moves settle on the soft spring. Reduced motion jumps. */
import { useEffect, useRef } from 'react';
import { useSpring } from '../../react/index.js';
import { motionAttrs } from '../motion.js';
const clamp = (p) => Math.min(100, Math.max(0, Number.isFinite(p) ? p : 0));
export function CompareCurtain({ className, slotProps, label, valueText, before, after, position, onMove, step = 4, motion, entering, exiting }) {
    const clamped = clamp(position);
    const clipRef = useRef(null);
    const dividerRef = useRef(null);
    const dragging = useRef(false);
    const live = useRef(true);
    function paint(p) {
        const c = clamp(p);
        if (clipRef.current)
            clipRef.current.style.clipPath = `inset(0 ${(100 - c).toFixed(2)}% 0 0)`;
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
        if (motion === false)
            paint(clamped);
    });
    function move(clientX) {
        const bounds = dividerRef.current?.parentElement?.getBoundingClientRect();
        if (!bounds || bounds.width === 0)
            return;
        const next = clamp(((clientX - bounds.left) / bounds.width) * 100);
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
        const delta = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? step : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -step : 0;
        if (delta !== 0) {
            e.preventDefault();
            onMove?.(clamp(clamped + delta));
            return;
        }
        if (e.key === 'Home') {
            e.preventDefault();
            onMove?.(0);
        }
        else if (e.key === 'End') {
            e.preventDefault();
            onMove?.(100);
        }
    }
    return (_jsxs("div", { className: "cieo cieo-compare", ...motionAttrs({ motion, entering, exiting }), ...customizePart(slotProps?.root, "cieo cieo-compare", undefined, className), children: [_jsx("div", { className: "cieo-compare-before", ...customizePart(slotProps?.before, "cieo-compare-before", undefined), children: before }), _jsx("div", { ref: clipRef, className: "cieo-compare-after", style: { clipPath: `inset(0 ${(100 - clamped).toFixed(2)}% 0 0)` }, ...customizePart(slotProps?.after, "cieo-compare-after", undefined), children: after }), _jsx("button", { ref: dividerRef, type: "button", role: "slider", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(clamped), "aria-valuetext": `${Math.round(clamped)} percent ${valueText}`, "aria-orientation": "horizontal", className: "cieo-compare-divider", style: { insetInlineStart: `${clamped.toFixed(2)}%` }, onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag, onKeyDown: onKeyDown, ...customizePart(slotProps?.divider, "cieo-compare-divider", undefined) })] }));
}
