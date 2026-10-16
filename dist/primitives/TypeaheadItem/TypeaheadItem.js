// src/primitives/TypeaheadItem/TypeaheadItem.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function TypeaheadItem({ value, selected = false, onSelect, children }) {
    return (_jsx("div", { role: "option", "aria-selected": selected, tabIndex: -1, "data-value": value, onClick: () => onSelect?.(value), onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(value);
        } }, className: "cieo cieo-p-typeahead-item", children: children }));
}
