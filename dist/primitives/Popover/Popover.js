'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
import { cloneElement, isValidElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDismiss, usePresence } from '../../react/index.js';
import { focusPopover, leavePopover, popoverStops } from './focus.js';
import { usePopoverPosition } from './usePopoverPosition.js';
export function Popover({ trigger, open, defaultOpen = false, onOpenChange, children, label, side = 'bottom', align = 'start', offset = 8, collisionPadding = 12, portal = true, motion = true, className, style, slots, slotProps }) {
    const [inner, setInner] = useState(defaultOpen);
    const [client, setClient] = useState(false);
    useEffect(() => setClient(true), []);
    const visible = open ?? inner;
    const panelId = useId();
    const keyboardOpen = useRef(false);
    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const [panel, setPanel] = useState(null);
    const attachPanel = useCallback((element) => { panelRef.current = element; setPanel(element); }, []);
    const presence = usePresence(visible, { disabled: !motion, kind: 'entrance', from: { y: -4, scale: .98, opacity: .7 } });
    const position = usePopoverPosition(presence.mounted, triggerRef, panel, { side, align, offset, padding: collisionPadding });
    const set = (next) => { if (open === undefined)
        setInner(next); onOpenChange?.(next); };
    const triggerElement = () => triggerRef.current?.querySelector('button,a[href],[tabindex]') ?? null;
    const restoreFocus = () => triggerElement()?.focus();
    useEffect(() => {
        if (visible && portal && position && keyboardOpen.current) {
            keyboardOpen.current = false;
            focusPopover(panelRef.current);
        }
    }, [visible, portal, position]);
    const toggle = (event) => { keyboardOpen.current = !visible && event.detail === 0; set(!visible); };
    const triggerKey = (event) => {
        if (visible && portal && event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault();
            focusPopover(panelRef.current);
        }
    };
    const panelKey = (event) => {
        const panel = panelRef.current;
        if (!portal || event.defaultPrevented || event.key !== 'Tab' || !panel)
            return;
        const stops = popoverStops(panel);
        const boundary = event.shiftKey ? stops[0] : stops.at(-1);
        if (!boundary || boundary === document.activeElement) {
            event.preventDefault();
            leavePopover(panel, triggerElement(), event.shiftKey);
            set(false);
        }
    };
    useDismiss(visible, (reason) => { set(false); if (reason === 'escape')
        restoreFocus(); }, [rootRef, panelRef]);
    const triggerNode = isValidElement(trigger) ? cloneElement(trigger, {
        'aria-haspopup': 'dialog', 'aria-expanded': visible, 'aria-controls': visible ? panelId : undefined,
        onKeyDown: (event) => {
            trigger.props.onKeyDown?.(event);
            if (!event.defaultPrevented)
                triggerKey(event);
        },
        onClick: (event) => {
            trigger.props.onClick?.(event);
            if (!event.defaultPrevented && !trigger.props.disabled && trigger.props['aria-disabled'] !== true && trigger.props['aria-disabled'] !== 'true')
                toggle(event);
        },
    }) : _jsx("button", { type: "button", "aria-haspopup": "dialog", "aria-expanded": visible, "aria-controls": visible ? panelId : undefined, onClick: toggle, onKeyDown: triggerKey, children: trigger });
    const content = presence.mounted ? _jsx("div", { ref: attachPanel, className: "cieo-p-popover-position", "data-side": position?.side ?? side, style: { position: 'fixed', left: position?.x ?? 0, top: position?.y ?? 0, maxWidth: position?.maxWidth,
            maxHeight: position?.maxHeight, pointerEvents: visible ? undefined : 'none', visibility: client && !position ? 'hidden' : undefined, zIndex: 'var(--cieo-popover-z, 50)' }, children: _jsxs("div", { ...customizePart(slotProps?.content), ref: presence.ref, id: panelId, role: "dialog", tabIndex: -1, onKeyDown: panelKey, "aria-label": label ?? (isValidElement(trigger) && typeof trigger.props.children === 'string' ? trigger.props.children : 'Popover'), "aria-hidden": !visible || undefined, inert: !visible || undefined, className: `cieo cieo-p-popover-panel ${slotProps?.content?.className ?? ''}`, style: { ...slotProps?.content?.style, maxWidth: 'inherit', maxHeight: 'inherit', overflow: 'auto' }, children: [slots?.header, slots?.content ?? children, slots?.footer] }) }) : null;
    return _jsxs("div", { ...customizePart(slotProps?.root), ref: rootRef, className: `cieo cieo-p-popover ${className ?? ''} ${slotProps?.root?.className ?? ''}`, style: { ...style, ...slotProps?.root?.style }, children: [_jsx("div", { ...customizePart(slotProps?.trigger), ref: triggerRef, className: `cieo-p-popover-trigger ${slotProps?.trigger?.className ?? ''}`, children: triggerNode }), client && portal ? createPortal(content, document.body) : content] });
}
