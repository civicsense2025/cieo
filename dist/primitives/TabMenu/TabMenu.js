// src/primitives/TabMenu/TabMenu.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* TabMenu. Menu-styled twin of TabList: same TabContext contract, vertical menu visuals. Host owns panels and persistence. */
import { useRef, useState } from 'react';
import { roveFocus } from '../../react/index.js';
import { TabContext } from '../TabList/TabList.js';
export function TabMenu({ label, value, defaultValue, onValueChange, children }) {
    const [internal, setInternal] = useState(defaultValue);
    const listRef = useRef(null);
    const current = value ?? internal;
    function handleSelect(next) {
        if (value === undefined)
            setInternal(next);
        onValueChange?.(next);
    }
    return (_jsx("div", { ref: listRef, role: "tablist", "aria-label": label, "data-variant": "menu", onKeyDown: (e) => { roveFocus(e, listRef.current, '[role="tab"]', { orientation: 'both', activate: true }); }, className: "cieo cieo-tab-menu", children: _jsx(TabContext.Provider, { value: { value: current, onSelect: handleSelect }, children: children }) }));
}
