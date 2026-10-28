// src/primitives/Stepper/Stepper.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function Stepper({ className, slotProps, label, steps }) {
    return (_jsx("nav", { "aria-label": label, className: "cieo cieo-stepper", ...customizePart(slotProps?.root, "cieo cieo-stepper", undefined, className), children: _jsx("ol", { children: steps.map((step, i) => (_jsx("li", { "data-state": step.state, "aria-current": step.state === 'current' ? 'step' : undefined, children: step.label }, `${i}-${step.label}`))) }) }));
}
