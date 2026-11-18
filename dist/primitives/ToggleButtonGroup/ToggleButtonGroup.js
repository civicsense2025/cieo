// src/primitives/ToggleButtonGroup/ToggleButtonGroup.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* ToggleButtonGroup. Single- or multiple-select group of ToggleButtons via controllable state. */
import { createContext, useMemo } from 'react';
import { useControllableState } from '../../state/react.js';
import { customizePart } from '../customization.js';
export const ToggleButtonGroupContext = createContext(null);
function toList(val) {
    if (val === undefined)
        return [];
    return typeof val === 'string' ? [val] : [...val];
}
export function ToggleButtonGroup({ className, slotProps, label, multiple = false, value, defaultValue, onValueChange, children, }) {
    const [selected, setSelected] = useControllableState({
        value: value !== undefined ? toList(value) : undefined,
        defaultValue: toList(defaultValue),
        onChange: (next) => {
            if (!onValueChange)
                return;
            if (multiple)
                onValueChange(next);
            else if (next[0] !== undefined)
                onValueChange(next[0]);
        },
    });
    const ctx = useMemo(() => ({
        value: selected[0],
        values: selected,
        multiple,
        isSelected: (item) => selected.includes(item),
        onSelect: (next) => {
            if (multiple) {
                setSelected((prev) => (prev.includes(next) ? prev.filter((x) => x !== next) : [...prev, next]));
            }
            else {
                setSelected([next]);
            }
        },
    }), [selected, multiple, setSelected]);
    return (_jsx("div", { role: "group", "aria-label": label, "data-multiple": multiple || undefined, className: "cieo cieo-toggle-button-group", ...customizePart(slotProps?.root, 'cieo cieo-toggle-button-group', undefined, className), children: _jsx(ToggleButtonGroupContext.Provider, { value: ctx, children: children }) }));
}
