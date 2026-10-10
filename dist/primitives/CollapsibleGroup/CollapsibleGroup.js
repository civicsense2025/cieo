'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function CollapsibleGroup({ label, children }) {
    return (_jsx("div", { role: "group", "aria-label": label, className: "cieo cieo-collapsible-group", children: children }));
}
