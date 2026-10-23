// src/primitives/DropdownMenuSubMenu/DropdownMenuSubMenu.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* DropdownMenuSubMenu. Nested flyout inside a menu. CSS hover/focus-within reveals the panel; arrow keys move in and out. */
import { useRef } from 'react';
import { enabledIn, roveIndex } from '../../react/index.js';
import { motionAttrs } from '../motion.js';
export function DropdownMenuSubMenu({ label, children, motion, entering = 'fade', exiting = 'fade' }) {
    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const items = () => enabledIn(panelRef.current, '[role^="menuitem"]').filter((el) => el.closest('[role="menu"]') === panelRef.current);
    function onTriggerKeyDown(event) {
        if (event.key !== 'ArrowRight' && event.key !== 'Enter' && event.key !== ' ')
            return;
        event.preventDefault();
        event.stopPropagation();
        items()[0]?.focus();
    }
    function onPanelKeyDown(event) {
        if (event.key === 'ArrowLeft' || event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            triggerRef.current?.focus();
            return;
        }
        const list = items();
        const to = roveIndex(event.key, list.findIndex((el) => el === document.activeElement), list.length);
        if (to === null)
            return;
        event.preventDefault();
        event.stopPropagation();
        list[to]?.focus();
    }
    return (_jsxs("div", { className: "cieo cieo-dropdown-menu-submenu", ...motionAttrs({ motion, entering, exiting }), children: [_jsx("button", { ref: triggerRef, type: "button", role: "menuitem", "aria-haspopup": "menu", "aria-label": label, onKeyDown: onTriggerKeyDown, className: "cieo-dropdown-menu-submenu-trigger", children: label }), _jsx("div", { ref: panelRef, role: "menu", "aria-label": label, onKeyDown: onPanelKeyDown, className: "cieo-dropdown-menu-submenu-panel", children: children })] }));
}
