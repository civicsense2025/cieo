// src/primitives/CommandPalette/CommandPalette.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* CommandPalette. Command-menu shell with controllable open + query state and spring enter/exit presence. */
import { createContext } from 'react';
import { roveFocus, usePresence } from '../../react/index.js';
import { useControllableState } from '../../state/react.js';
import { customizePart } from '../customization.js';
export const CommandPaletteContext = createContext(null);
export function CommandPalette({ className, slotProps, label, open: openProp, defaultOpen = true, onOpenChange, query: queryProp, defaultQuery, onQueryChange, onClose, onNavigate, onActivate, motion, children, }) {
    const [isOpen, setOpen] = useControllableState({
        value: openProp,
        defaultValue: defaultOpen,
        onChange: onOpenChange,
    });
    const [query, setQuery] = useControllableState({
        value: queryProp,
        defaultValue: defaultQuery,
        onChange: (next) => {
            if (next !== undefined)
                onQueryChange?.(next);
        },
    });
    const { mounted, ref } = usePresence(isOpen, {
        disabled: motion === false,
        from: { x: 0, y: 4, scale: 0.98, opacity: 0, blur: 0 },
    });
    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
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
    if (!mounted)
        return null;
    const hasQueryState = queryProp !== undefined || defaultQuery !== undefined || onQueryChange !== undefined;
    return (_jsx(CommandPaletteContext.Provider, { value: { query, onQueryChange: hasQueryState ? (q) => setQuery(q) : undefined }, children: _jsx("div", { ref: ref, role: "dialog", "aria-label": label, "data-query": query, onKeyDown: onKeyDown, className: "cieo cieo-p-command-palette", ...customizePart(slotProps?.root, 'cieo cieo-p-command-palette', undefined, className), children: children }) }));
}
