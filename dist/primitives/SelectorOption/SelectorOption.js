// src/primitives/SelectorOption/SelectorOption.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function SelectorOption({ value, label, disabled = false }) {
    return (_jsx("option", { value: value, disabled: disabled, children: label ?? value }));
}
