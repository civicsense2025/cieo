'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function FileInput({ label, name, accept, multiple = false }) {
    return (_jsxs("label", { className: "cieo", children: [_jsx("span", { className: "cieo-label", children: label }), _jsx("input", { type: "file", className: "cieo cieo-input", name: name, accept: accept, multiple: multiple })] }));
}
