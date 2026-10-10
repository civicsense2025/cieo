// src/primitives/FormLayout/FormLayout.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function FormLayout({ columns = 1, children }) {
    return (_jsx("div", { "data-columns": columns, style: { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }, className: "cieo cieo-form-layout", children: children }));
}
