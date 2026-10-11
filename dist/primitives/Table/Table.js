'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function Table({ label, children }) {
    return (_jsx("table", { "aria-label": label, className: "cieo cieo-table", children: children }));
}
