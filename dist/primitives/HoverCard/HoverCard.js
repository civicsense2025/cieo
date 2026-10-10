// src/primitives/HoverCard/HoverCard.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* HoverCard. Rich hover card on the Tooltip CSS-reveal pattern. Trigger keeps its own name; content is the card body. */
import { cloneElement, isValidElement, useId } from 'react';
export function HoverCard({ content, children }) {
    const id = useId();
    const trigger = isValidElement(children)
        ? cloneElement(children, { 'aria-describedby': id })
        : _jsx("span", { "aria-describedby": id, className: "cieo-p-hover-card-trigger", children: children });
    return (_jsxs("span", { className: "cieo cieo-p-hover-card", children: [trigger, _jsx("span", { id: id, className: "cieo-p-hover-card-card", children: content })] }));
}
