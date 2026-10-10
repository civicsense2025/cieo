'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function IconButton({ label, size = 'md', children }) {
    return (_jsx("button", { type: "button", "aria-label": label, "data-size": size, className: "cieo cieo-icon-button", children: children }));
}
