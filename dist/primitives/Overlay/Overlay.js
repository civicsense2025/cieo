'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function Overlay({ className, slotProps, onPress } = {}) {
    return (_jsx("div", { "aria-hidden": "true", onClick: onPress, className: "cieo cieo-p-overlay", ...customizePart(slotProps?.root, "cieo cieo-p-overlay", undefined, className) }));
}
