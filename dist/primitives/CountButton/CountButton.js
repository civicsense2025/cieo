// src/primitives/CountButton/CountButton.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* CountButton. Ghost icon button with a rolling count: a toggle (like, repost) when `pressed` is given, a plain action (reply, share) otherwise. The host owns the state and the number. */
import { useRef, useState } from 'react';
import { useReducedMotion, useSpring } from '../../react/index.js';
import { CompactCount, formatExactCount } from '../CompactCount/CompactCount.js';
import { customizePart } from '../customization.js';
/** Accessible name that carries the exact count: "Like, 164 likes". A zero, missing or invalid count gives just the label. */
export function countButtonLabel(label, count, unit) {
    if (typeof count !== 'number' || !Number.isFinite(count) || Math.floor(count) <= 0)
        return label;
    return `${label}, ${formatExactCount(count)}${unit ? ` ${unit}` : ''}`;
}
/** Scale the icon dips to on press before settling back to 1. */
export const COUNT_BUTTON_DIP = 0.8;
export function CountButton({ className, slotProps, icon, activeIcon, label, count, countUnit, pressed, onPress, tone = 'neutral', size = 'md', disabled }) {
    const reduced = useReducedMotion();
    const iconRef = useRef(null);
    const [dip, setDip] = useState(false);
    useSpring(dip ? COUNT_BUTTON_DIP : 1, (v) => { if (iconRef.current)
        iconRef.current.style.transform = v === 1 ? '' : `scale(${v})`; }, {
        preset: 'snap',
        onSettle: (v) => { if (v < 1)
            setDip(false); },
    });
    const toggle = pressed !== undefined;
    return (_jsxs("button", { type: "button", className: "cieo cieo-count-button", "aria-label": countButtonLabel(label, count, countUnit), "aria-pressed": toggle ? pressed : undefined, "data-tone": tone, "data-size": size, "data-pressed": toggle && pressed ? '' : undefined, "data-has-active-icon": activeIcon !== undefined ? '' : undefined, disabled: disabled, onClick: () => {
            if (!reduced)
                setDip(true);
            onPress?.();
        }, ...customizePart(slotProps?.root, "cieo cieo-count-button", undefined, className), children: [_jsxs("span", { className: "cieo-count-button-icon", ref: iconRef, "aria-hidden": "true", ...customizePart(slotProps?.icon, "cieo-count-button-icon", undefined), children: [_jsx("span", { className: "cieo-count-button-glyph", "data-glyph": "base", ...customizePart(slotProps?.glyph, "cieo-count-button-glyph", undefined), children: icon }), activeIcon !== undefined ? _jsx("span", { className: "cieo-count-button-glyph", "data-glyph": "active", ...customizePart(slotProps?.glyph, "cieo-count-button-glyph", undefined), children: activeIcon }) : null] }), count !== undefined ? (_jsx("span", { className: "cieo-count-button-count", "aria-hidden": "true", ...customizePart(slotProps?.count, "cieo-count-button-count", undefined), children: _jsx(CompactCount, { value: count ?? 0, unit: countUnit }) })) : null] }));
}
