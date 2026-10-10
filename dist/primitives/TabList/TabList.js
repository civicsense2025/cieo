// src/primitives/TabList/TabList.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* TabList. Tab row owning the selected value (controlled or not). Exports TabContext for Tab and TabMenu. */
import { createContext, useState } from 'react';
export const TabContext = createContext(null);
export function TabList({ label, value, defaultValue, onValueChange, children }) {
    const [internal, setInternal] = useState(defaultValue);
    const current = value ?? internal;
    function handleSelect(next) {
        if (value === undefined)
            setInternal(next);
        onValueChange?.(next);
    }
    return (_jsx("div", { role: "tablist", "aria-label": label, className: "cieo cieo-tab-list", children: _jsx(TabContext.Provider, { value: { value: current, onSelect: handleSelect }, children: children }) }));
}
