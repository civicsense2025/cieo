'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function ProgressBar({ className, slotProps, value, max = 100, label }) {
    return (_jsx("progress", { value: value, max: max, "aria-label": label, className: "cieo cieo-progress", ...customizePart(slotProps?.root, "cieo cieo-progress", undefined, className) }));
}
