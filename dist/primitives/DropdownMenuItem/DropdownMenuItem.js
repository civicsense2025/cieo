// src/primitives/DropdownMenuItem/DropdownMenuItem.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* DropdownMenuItem. Single menu action. Label or children supply the text; disabled removes it from selection. */
import { useContext } from 'react';
import { DropdownMenuContext } from '../DropdownMenu/DropdownMenu.js';
import { customizePart } from '../customization.js';
export function DropdownMenuItem({ className, slotProps, label, disabled = false, onSelect, children }) {
    const menu = useContext(DropdownMenuContext);
    return (_jsx("button", { type: "button", role: "menuitem", "aria-label": label, disabled: disabled, onClick: () => { onSelect?.(); menu?.close(); }, className: "cieo cieo-dropdown-menu-item", ...customizePart(slotProps?.root, "cieo cieo-dropdown-menu-item", undefined, className), children: children ?? label }));
}
