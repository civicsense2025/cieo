// src/primitives/FormLayout/FormLayout.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function FormLayout({ className, slotProps, columns = 1, children }) {
    return (_jsx("div", { "data-columns": columns, style: { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }, className: "cieo cieo-form-layout", ...customizePart(slotProps?.root, "cieo cieo-form-layout", { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }, className), children: children }));
}
