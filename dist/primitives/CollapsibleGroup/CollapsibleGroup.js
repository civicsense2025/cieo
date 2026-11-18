'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* CollapsibleGroup. role=group accordion shell supporting single and multiple open items via value/defaultValue/onValueChange. */
import { createContext, useMemo } from 'react';
import { useControllableState } from '../../state/react.js';
import { customizePart } from '../customization.js';
export const CollapsibleGroupContext = createContext(null);
function toArray(val) {
    if (val === undefined)
        return [];
    if (typeof val === 'string')
        return val.length > 0 ? [val] : [];
    return [...val];
}
export function CollapsibleGroup({ className, slotProps, label, multiple, type, collapsible = true, value, defaultValue, onValueChange, children, }) {
    const isMulti = multiple ?? type === 'multiple';
    const coordinated = value !== undefined || defaultValue !== undefined || onValueChange !== undefined || multiple !== undefined || type !== undefined;
    const controlledArr = value !== undefined ? toArray(value) : undefined;
    const [openIds, setOpenIds] = useControllableState({
        value: controlledArr,
        defaultValue: toArray(defaultValue),
        onChange: (next) => {
            if (!onValueChange)
                return;
            if (isMulti)
                onValueChange(next);
            else
                onValueChange(next[0] ?? '');
        },
    });
    const ctx = useMemo(() => {
        if (!coordinated)
            return null;
        return {
            isOpen: (id) => openIds.includes(id),
            toggleItem: (id) => {
                if (isMulti) {
                    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
                }
                else {
                    setOpenIds((prev) => (prev[0] === id ? (collapsible ? [] : prev) : [id]));
                }
            },
        };
    }, [coordinated, openIds, isMulti, collapsible, setOpenIds]);
    return (_jsx("div", { role: "group", "aria-label": label, "data-multiple": coordinated ? isMulti : undefined, className: "cieo cieo-collapsible-group", ...customizePart(slotProps?.root, 'cieo cieo-collapsible-group', undefined, className), children: _jsx(CollapsibleGroupContext.Provider, { value: ctx, children: children }) }));
}
