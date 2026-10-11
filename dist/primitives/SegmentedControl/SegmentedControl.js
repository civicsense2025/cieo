// src/primitives/SegmentedControl/SegmentedControl.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* SegmentedControl. Single-select pill of segments. Owns the picked value (controlled or not); segments follow it by their value key. */
import { createContext, useState } from 'react';
export const SegmentedControlContext = createContext(null);
export function SegmentedControl({ label, value, defaultValue, onValueChange, children }) {
    const [internal, setInternal] = useState(defaultValue);
    const current = value ?? internal;
    function handleSelect(next) {
        if (value === undefined)
            setInternal(next);
        onValueChange?.(next);
    }
    return (_jsx("div", { role: "group", "aria-label": label, className: "cieo cieo-segmented-control", children: _jsx(SegmentedControlContext.Provider, { value: { value: current, onSelect: handleSelect }, children: children }) }));
}
