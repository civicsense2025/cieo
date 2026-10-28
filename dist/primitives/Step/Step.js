// src/primitives/Step/Step.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function Step({ className, slotProps, state = 'todo', children }) {
    return (_jsx("li", { "data-state": state, "aria-current": state === 'current' ? 'step' : undefined, className: "cieo cieo-step", ...customizePart(slotProps?.root, "cieo cieo-step", undefined, className), children: children }));
}
