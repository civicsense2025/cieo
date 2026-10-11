// src/primitives/DropdownMenuRadioItem/DropdownMenuRadioItem.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* DropdownMenuRadioItem. One pick inside DropdownMenuRadioGroup. Checked when the group value equals its own value. */
import { useContext } from 'react';
import { DropdownMenuRadioGroupContext } from '../DropdownMenuRadioGroup/DropdownMenuRadioGroup.js';
export function DropdownMenuRadioItem({ label, value }) {
    const group = useContext(DropdownMenuRadioGroupContext);
    const checked = group?.value === value;
    return (_jsx("button", { type: "button", role: "menuitemradio", "aria-checked": checked, "aria-label": label, "data-checked": checked, onClick: () => group?.onSelect?.(value), className: "cieo cieo-dropdown-menu-radio-item", children: label }));
}
