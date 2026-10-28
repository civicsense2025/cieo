'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function TimeInput({ className, slotProps, label, name, value, defaultValue, onChange, min, max, disabled, required }) {
    return (_jsxs("label", { className: "cieo", ...customizePart(slotProps?.root, "cieo", undefined, className), children: [_jsx("span", { className: "cieo-label", ...customizePart(slotProps?.label, "cieo-label", undefined), children: label }), _jsx("input", { type: "time", className: "cieo cieo-input", name: name, value: value, defaultValue: value === undefined ? defaultValue : undefined, min: min, max: max, disabled: disabled, required: required, onChange: (e) => onChange?.(e.currentTarget.value), ...customizePart(slotProps?.input, "cieo cieo-input", undefined) })] }));
}
