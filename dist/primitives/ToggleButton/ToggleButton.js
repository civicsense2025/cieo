// src/primitives/ToggleButton/ToggleButton.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* ToggleButton. Two-state press button. Standalone it reports pressed via prop; inside ToggleButtonGroup it follows the group value by its value key. */
import { useContext } from 'react';
import { ToggleButtonGroupContext } from '../ToggleButtonGroup/ToggleButtonGroup.js';
export function ToggleButton({ label, pressed = false, value, onPressedChange, children }) {
    const group = useContext(ToggleButtonGroupContext);
    const inGroup = group !== null && value !== undefined;
    const isPressed = inGroup ? group.value === value : pressed;
    function handleClick() {
        if (inGroup) {
            group.onSelect?.(value);
            return;
        }
        onPressedChange?.(!pressed);
    }
    return (_jsx("button", { type: "button", "aria-pressed": isPressed, "aria-label": label, "data-pressed": isPressed, onClick: handleClick, className: "cieo cieo-toggle-button", children: children }));
}
