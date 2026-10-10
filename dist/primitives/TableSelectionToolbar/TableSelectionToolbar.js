'use client';
import { jsxs as _jsxs } from "react/jsx-runtime";
export function TableSelectionToolbar({ selectedCount, children }) {
    return (_jsxs("div", { role: "toolbar", "aria-label": `${selectedCount} selected`, className: "cieo cieo-table-selection-toolbar", children: [_jsxs("span", { children: [selectedCount, " selected"] }), children] }));
}
