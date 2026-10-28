// src/primitives/SegmentedControlItem/SegmentedControlItem.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* SegmentedControlItem. One segment inside SegmentedControl. Pressed when the control value equals its own value. */
import { useContext } from 'react';
import { SegmentedControlContext } from '../SegmentedControl/SegmentedControl.js';
import { customizePart } from '../customization.js';
export function SegmentedControlItem({ className, slotProps, value, children }) {
    const control = useContext(SegmentedControlContext);
    const picked = control?.value === value;
    return (_jsx("button", { type: "button", "aria-pressed": picked, "data-picked": picked, onClick: () => control?.onSelect?.(value), className: "cieo cieo-segmented-control-item", ...customizePart(slotProps?.root, "cieo cieo-segmented-control-item", undefined, className), children: children }));
}
