// src/primitives/MultiSelector/MultiSelector.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* MultiSelector. Label plus a native multi-select. Renders the design-system .cieo-input so there is exactly one input style; this file owns the contract, not the paint. */
import { useId } from 'react';
export function MultiSelector({ className, slotProps, label, values, onChange, children }) {
    const id = useId();
    return (_jsxs("div", { className: "cieo cieo-p-multi-selector", ...customizePart(slotProps?.root, "cieo cieo-p-multi-selector", undefined, className), children: [_jsx("label", { htmlFor: id, children: label }), _jsx("select", { id: id, multiple: true, value: values, onChange: (e) => onChange?.([...e.currentTarget.selectedOptions].map((o) => o.value)), className: "cieo-input", ...customizePart(slotProps?.input, "cieo-input"), children: children })] }));
}
