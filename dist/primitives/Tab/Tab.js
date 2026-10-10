// src/primitives/Tab/Tab.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* Tab. One tab inside TabList (or TabMenu). Selected when the shared value equals its own value; standalone it renders a plain button. */
import { useContext } from 'react';
import { TabContext } from '../TabList/TabList.js';
export function Tab({ value, children }) {
    const tabs = useContext(TabContext);
    if (tabs === null) {
        return (_jsx("button", { type: "button", className: "cieo cieo-tab", children: children }));
    }
    const selected = tabs.value === value;
    return (_jsx("button", { type: "button", role: "tab", "aria-selected": selected, "data-selected": selected, onClick: () => tabs.onSelect?.(value), className: "cieo cieo-tab", children: children }));
}
