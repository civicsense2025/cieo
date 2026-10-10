'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Field({ label, htmlFor, description, error, children }) {
    const helpId = htmlFor ? (error ? `${htmlFor}-error` : description ? `${htmlFor}-help` : undefined) : undefined;
    return (_jsxs("div", { className: "cieo cieo-p-field", children: [_jsx("label", { htmlFor: htmlFor, children: label }), children, error ? _jsx("p", { id: helpId, role: "alert", className: "cieo-p-help", "data-tone": "danger", children: error }) : description ? _jsx("p", { id: helpId, className: "cieo-p-help", children: description }) : null] }));
}
