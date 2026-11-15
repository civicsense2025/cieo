'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* PaletteSwatches. Selectable row of color swatches as a native radiogroup. Arrow keys, checking, and form
   participation come from the radios; the dots are paint only. Swatch fills are content data (artwork colors),
   so they render from the swatch record, not from theme tokens. */
import { useState } from 'react';
export function PaletteSwatches({ className, slotProps, label, name, swatches, value, defaultValue, onValueChange, disabled, size = 'md' }) {
    const [internal, setInternal] = useState(defaultValue);
    const current = value ?? internal;
    function pick(next) {
        if (value === undefined)
            setInternal(next);
        onValueChange?.(next);
    }
    return (_jsx("div", { role: "radiogroup", "aria-label": label, "data-size": size, className: "cieo cieo-swatches", ...customizePart(slotProps?.root, "cieo cieo-swatches", undefined, className), children: swatches.map((swatch) => {
            const picked = current === swatch.value;
            return (_jsxs("label", { "data-picked": picked, className: "cieo-swatch", ...customizePart(slotProps?.swatch, "cieo-swatch", undefined), children: [_jsx("input", { type: "radio", name: name, value: swatch.value, checked: current === undefined ? undefined : picked, defaultChecked: value === undefined && defaultValue === swatch.value ? true : undefined, disabled: disabled, "aria-label": swatch.label, onChange: () => pick(swatch.value) }), _jsx("span", { "aria-hidden": "true", className: "cieo-swatch-dot", style: { backgroundColor: swatch.color }, ...customizePart(slotProps?.dot, "cieo-swatch-dot", undefined) })] }, swatch.value));
        }) }));
}
