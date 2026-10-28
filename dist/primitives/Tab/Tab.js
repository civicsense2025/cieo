// src/primitives/Tab/Tab.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* Tab. One tab inside TabList (or TabMenu). Selected when the shared value equals its own value; standalone it renders a plain button. */
import { useContext, useLayoutEffect, useRef } from 'react';
import { TabContext } from '../TabList/TabList.js';
export function Tab({ value, children, id, controls, className, slotProps }) {
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
        return (_jsx("button", { ...customizePart(slotProps?.root), id: id, type: "button", className: `cieo cieo-tab ${className ?? ''} ${slotProps?.root?.className ?? ''}`, children: children }));
    }
    return (_jsx("button", { ...customizePart(slotProps?.root), id: id, "aria-controls": controls, ref: ref, type: "button", role: "tab", "aria-selected": selected, tabIndex: tabs.value === undefined || selected ? 0 : -1, "data-selected": selected, onClick: () => tabs.onSelect?.(value), className: `cieo cieo-tab ${className ?? ''} ${slotProps?.root?.className ?? ''}`, children: children }));
}
