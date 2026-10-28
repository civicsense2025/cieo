// src/primitives/DropdownMenuCheckboxItem/DropdownMenuCheckboxItem.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function DropdownMenuCheckboxItem({ className, slotProps, label, checked = false, onCheckedChange, children }) {
    return (_jsx("button", { type: "button", role: "menuitemcheckbox", "aria-checked": checked, "aria-label": label, "data-checked": checked, onClick: () => onCheckedChange?.(!checked), className: "cieo cieo-dropdown-menu-checkbox-item", ...customizePart(slotProps?.root, "cieo cieo-dropdown-menu-checkbox-item", undefined, className), children: children ?? label }));
}
