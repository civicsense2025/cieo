// src/primitives/TypeaheadItem/TypeaheadItem.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function TypeaheadItem({ value, onSelect, children }) {
    return (_jsx("div", { role: "option", "aria-selected": "false", "data-value": value, onClick: () => onSelect?.(value), className: "cieo cieo-p-typeahead-item", children: children }));
}
