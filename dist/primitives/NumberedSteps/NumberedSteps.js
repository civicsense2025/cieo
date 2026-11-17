// src/primitives/NumberedSteps/NumberedSteps.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function NumberedSteps({ className, slotProps, steps }) {
    return (_jsx("ol", { ...customizePart(slotProps?.root, "cieo cieo-p-numbered-steps", undefined, className), children: steps.map((s, i) => _jsxs("li", { children: [_jsx("span", { "aria-hidden": "true", children: i + 1 }), _jsx("b", { children: s.title }), s.detail ? _jsx("small", { children: s.detail }) : null] }, i)) }));
}
