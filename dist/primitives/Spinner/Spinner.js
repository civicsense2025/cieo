'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function Spinner({ label = 'Loading', size = 'md' }) {
    return (_jsx("span", { role: "status", "aria-label": label, "data-size": size, className: "cieo cieo-p-spinner", children: _jsx("span", { "aria-hidden": "true", className: "cieo-p-spinner-ring" }) }));
}
