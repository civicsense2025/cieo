// src/primitives/MoreMenu/MoreMenu.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { DropdownMenu } from '../DropdownMenu/DropdownMenu.js';
import { IconButton } from '../IconButton/IconButton.js';
export function MoreMenu({ label = 'More actions', children, className, slotProps }) {
    return (_jsx(DropdownMenu, { className: className, slotProps: slotProps, label: label, trigger: _jsx(IconButton, { label: label, children: "\u22EF" }), children: children }));
}
