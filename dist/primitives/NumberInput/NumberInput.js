'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function NumberInput({ label, min, max, step, defaultValue }) {
    return (_jsxs("label", { className: "cieo", children: [_jsx("span", { className: "cieo-label", children: label }), _jsx("input", { type: "number", className: "cieo cieo-input", min: min, max: max, step: step, defaultValue: defaultValue })] }));
}
