// src/primitives/Kbd/Kbd.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function Kbd({ className, slotProps, children }) {
    return _jsx("kbd", { className: "cieo cieo-p-kbd", ...customizePart(slotProps?.root, "cieo cieo-p-kbd", undefined, className), children: children });
}
