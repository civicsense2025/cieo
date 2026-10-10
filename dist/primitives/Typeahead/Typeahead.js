// src/primitives/Typeahead/Typeahead.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* Typeahead. Controlled combobox shell: label plus input plus host-filtered matches. Host owns filtering; open reflects match presence. */
import { useId } from 'react';
export function Typeahead({ label, value, onChange, open = false, children }) {
    const inputId = useId();
    const listId = useId();
    return (_jsxs("div", { className: "cieo cieo-p-typeahead", children: [_jsx("label", { htmlFor: inputId, children: label }), _jsx("input", { id: inputId, type: "text", role: "combobox", "aria-expanded": open, "aria-controls": listId, "aria-autocomplete": "list", value: value, onChange: (e) => onChange?.(e.currentTarget.value), className: "cieo-p-typeahead-input" }), open ? (_jsx("div", { role: "listbox", id: listId, className: "cieo-p-typeahead-list", children: children })) : null] }));
}
