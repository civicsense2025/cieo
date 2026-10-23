// src/primitives/Stepper/Stepper.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function Stepper({ label, steps }) {
    return (_jsx("nav", { "aria-label": label, className: "cieo cieo-stepper", children: _jsx("ol", { children: steps.map((step, i) => (_jsx("li", { "data-state": step.state, "aria-current": step.state === 'current' ? 'step' : undefined, children: step.label }, `${i}-${step.label}`))) }) }));
}
