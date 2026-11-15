// src/primitives/SegmentedControlItem/SegmentedControlItem.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* SegmentedControlItem. One segment inside SegmentedControl. Pressed when the control value equals its own value. */
import { useContext } from 'react';
import { SegmentedControlContext } from '../SegmentedControl/SegmentedControl.js';
import { customizePart } from '../customization.js';
export function SegmentedControlItem({ className, slotProps, value, href, children }) {
    const control = useContext(SegmentedControlContext);
    const picked = control?.value === value;
    if (href !== undefined) {
        return (_jsx("a", { href: href, "aria-current": picked ? 'page' : undefined, "data-picked": picked, onClick: () => control?.onSelect?.(value), className: "cieo cieo-segmented-control-item", ...customizePart(slotProps?.root, "cieo cieo-segmented-control-item", undefined, className), children: children }));
    }
    return (_jsx("button", { type: "button", "aria-pressed": picked, "data-picked": picked, onClick: () => control?.onSelect?.(value), className: "cieo cieo-segmented-control-item", ...customizePart(slotProps?.root, "cieo cieo-segmented-control-item", undefined, className), children: children }));
}
