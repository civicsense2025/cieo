// src/primitives/SelectorOption/SelectorOption.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function SelectorOption({ className, slotProps, value, label, disabled = false }) {
    return (_jsx("option", { value: value, disabled: disabled, ...customizePart(slotProps?.root, undefined, undefined, className), children: label ?? value }));
}
