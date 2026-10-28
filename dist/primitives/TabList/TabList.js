// src/primitives/TabList/TabList.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* TabList. Tab row owning the selected value (controlled or not). Exports TabContext for Tab and TabMenu. */
import { createContext, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { roveFocus, useEdges } from '../../react/index.js';
export const TabContext = createContext(null);
export function TabList({ label, value, defaultValue, onValueChange, motion, children, className, slotProps }) {
    const [internal, setInternal] = useState(defaultValue);
    const current = value ?? internal;
    const tabsRef = useRef(new Map());
    const indicatorRef = useRef(null);
    const listRef = useRef(null);
    const [style, setStyle] = useState({ left: 0, width: 0 });
    function handleSelect(next) {
        if (value === undefined)
            setInternal(next);
        onValueChange?.(next);
    }
    const registerTab = useCallback((key, el) => {
        if (el)
            tabsRef.current.set(key, el);
        else
            tabsRef.current.delete(key);
    }, []);
    useLayoutEffect(() => {
        function measure() {
            const el = current !== undefined ? tabsRef.current.get(current) : undefined;
            /* offsetLeft/offsetWidth read layout, so skip the state write (and its re-render) when nothing moved. */
            if (el) {
                const left = el.offsetLeft;
                const width = el.offsetWidth;
                setStyle((p) => (p.left === left && p.width === width ? p : { left, width }));
            }
        }
        measure();
        const observer = new ResizeObserver(measure);
        if (listRef.current)
            observer.observe(listRef.current);
        const selected = current !== undefined ? tabsRef.current.get(current) : undefined;
        if (selected)
            observer.observe(selected);
        window.addEventListener('resize', measure);
        return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
    }, [current]);
    useEdges(indicatorRef, `${current ?? ''}:${style.left}:${style.width}`, { disabled: motion === false });
    return (_jsxs("div", { ...customizePart(slotProps?.root), ref: listRef, role: "tablist", "aria-label": label, onKeyDown: (e) => { roveFocus(e, listRef.current, '[role="tab"]', { orientation: 'horizontal', activate: true }); }, className: `cieo cieo-tab-list ${className ?? ''} ${slotProps?.root?.className ?? ''}`, "data-motion": motion === false ? 'off' : undefined, children: [_jsx(TabContext.Provider, { value: { value: current, onSelect: handleSelect, registerTab }, children: children }), _jsx("span", { ...customizePart(slotProps?.indicator), ref: indicatorRef, className: `cieo-tab-indicator ${slotProps?.indicator?.className ?? ''}`, style: { ...slotProps?.indicator?.style, left: style.left, width: style.width }, "aria-hidden": "true" })] }));
}
