'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function ResizeHandle({ className, slotProps, orientation = 'vertical', label, ...rest }) {
    return (_jsx("div", { role: "separator", "aria-orientation": orientation, "aria-label": label, "data-orientation": orientation, className: "cieo cieo-p-resize", ...rest, ...customizePart(slotProps?.root, "cieo cieo-p-resize", undefined, className) }));
}
