// src/primitives/TabMenu/TabMenu.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* TabMenu. Menu-styled twin of TabList: same TabContext contract, vertical menu visuals. Host owns panels and persistence. */
import { useState } from 'react';
import { TabContext } from '../TabList/TabList.js';
export function TabMenu({ label, value, defaultValue, onValueChange, children }) {
    const [internal, setInternal] = useState(defaultValue);
    const current = value ?? internal;
    function handleSelect(next) {
        if (value === undefined)
            setInternal(next);
        onValueChange?.(next);
    }
    return (_jsx("div", { role: "tablist", "aria-label": label, "data-variant": "menu", className: "cieo cieo-tab-menu", children: _jsx(TabContext.Provider, { value: { value: current, onSelect: handleSelect }, children: children }) }));
}
