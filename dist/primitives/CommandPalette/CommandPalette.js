// src/primitives/CommandPalette/CommandPalette.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* CommandPalette. Command-menu shell. Host filters items from the query; this owns dialog structure, Escape and arrow-key movement. */
import { createContext, useRef } from 'react';
import { roveFocus } from '../../react/index.js';
export const CommandPaletteContext = createContext(null);
export function CommandPalette({ className, slotProps, label, query, onQueryChange, onClose, onNavigate, onActivate, children }) {
    const ref = useRef(null);
    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onClose?.();
            return;
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            if (onNavigate) {
                e.preventDefault();
                onNavigate(e.key === 'ArrowDown' ? 1 : -1);
            }
            else
                roveFocus(e, ref.current, '[role="option"]');
            return;
        }
        if (e.key === 'Enter' && onActivate && e.target.tagName === 'INPUT') {
            e.preventDefault();
            onActivate();
        }
    };
    return (_jsx(CommandPaletteContext.Provider, { value: { query, onQueryChange }, children: _jsx("div", { ref: ref, role: "dialog", "aria-label": label, "data-query": query, onKeyDown: onKeyDown, className: "cieo cieo-p-command-palette", ...customizePart(slotProps?.root, "cieo cieo-p-command-palette", undefined, className), children: children }) }));
}
