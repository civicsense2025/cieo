'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* Tooltip. Hover/focus hint for icon-only controls. CSS reveal only; the trigger keeps its own accessible name. */
import { cloneElement, isValidElement, useId } from 'react';
export function Tooltip({ text, children }) {
    const id = useId();
    const trigger = isValidElement(children)
        ? cloneElement(children, { 'aria-describedby': id })
        : _jsx("span", { "aria-describedby": id, className: "cieo-p-tooltip-trigger", children: children });
    return (_jsxs("span", { className: "cieo cieo-p-tooltip", children: [trigger, _jsx("span", { id: id, role: "tooltip", className: "cieo-p-tooltip-bubble", children: text })] }));
}
