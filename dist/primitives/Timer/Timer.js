// src/primitives/Timer/Timer.tsx
'use client';
import { jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function Timer({ className, slotProps, seconds }) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return (_jsxs("time", { dateTime: `PT${seconds}S`, className: "cieo cieo-p-timer", ...customizePart(slotProps?.root, "cieo cieo-p-timer", undefined, className), children: [mm, ":", ss] }));
}
