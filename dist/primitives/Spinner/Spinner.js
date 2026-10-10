'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function Spinner({ label = 'Loading', size = 'md', motion }) {
    return (_jsx("span", { role: "status", "aria-label": label, "data-size": size, "data-motion": motion === false ? 'off' : undefined, className: "cieo cieo-p-spinner", children: _jsx("span", { "aria-hidden": "true", className: "cieo-p-spinner-ring" }) }));
}
