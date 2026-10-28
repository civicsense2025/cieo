// src/primitives/DropdownMenuRadioGroup/DropdownMenuRadioGroup.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* DropdownMenuRadioGroup. Single-select group of radio rows in a menu. Owns the picked value (controlled or not); items follow it by their value key. */
import { createContext, useState } from 'react';
import { customizePart } from '../customization.js';
export const DropdownMenuRadioGroupContext = createContext(null);
export function DropdownMenuRadioGroup({ className, slotProps, label, value, defaultValue, onValueChange, children }) {
    const [internal, setInternal] = useState(defaultValue);
    const current = value ?? internal;
    function handleSelect(next) {
        if (value === undefined)
            setInternal(next);
        onValueChange?.(next);
    }
    return (_jsx("div", { role: "group", "aria-label": label, className: "cieo cieo-dropdown-menu-radio-group", ...customizePart(slotProps?.root, "cieo cieo-dropdown-menu-radio-group", undefined, className), children: _jsx(DropdownMenuRadioGroupContext.Provider, { value: { value: current, onSelect: handleSelect }, children: children }) }));
}
