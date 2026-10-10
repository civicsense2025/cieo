// src/primitives/Tab/Tab.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* Tab. One tab inside TabList (or TabMenu). Selected when the shared value equals its own value; standalone it renders a plain button. */
import { useContext, useLayoutEffect, useRef } from 'react';
import { TabContext } from '../TabList/TabList.js';
export function Tab({ value, children }) {
    const tabs = useContext(TabContext);
    const ref = useRef(null);
    const selected = tabs?.value === value;
    const registerTab = tabs?.registerTab;
    useLayoutEffect(() => {
        if (!selected || !registerTab)
            return;
        const el = ref.current;
        if (!el)
            return;
        registerTab(value, el);
        return () => registerTab(value, null);
    }, [selected, registerTab, value]);
    if (tabs === null) {
        return (_jsx("button", { type: "button", className: "cieo cieo-tab", children: children }));
    }
    return (_jsx("button", { ref: ref, type: "button", role: "tab", "aria-selected": selected, "data-selected": selected, onClick: () => tabs.onSelect?.(value), className: "cieo cieo-tab", children: children }));
}
