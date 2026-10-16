// src/primitives/DropdownMenu/DropdownMenu.tsx
'use client';
/* DropdownMenu. Menu shell. Trigger toggles it; Escape, outside press and choosing an item close it and return focus. Controlled `open` always wins. */
import { cloneElement, createContext, isValidElement, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { enabledIn, roveIndex, useDismiss } from '../../react/index.js';

export interface DropdownMenuContextValue {
  /** Closes the menu and returns focus to the trigger. */
  close: () => void;
}
export const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export interface DropdownMenuProps {
  /** Accessible name for the menu (e.g. "File actions"). Required. */
  label: string;
  /** Open state when controlled. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to false. */
  defaultOpen?: boolean;
  /** Called with the next open state. */
  onOpenChange?: (open: boolean) => void;
  /** Opener control (usually a Button). Exactly one. */
  trigger: ReactNode;
  children: ReactNode;
}

type TriggerProps = { onClick?: (event: MouseEvent) => void; onKeyDown?: (event: KeyboardEvent) => void };

export function DropdownMenu({ label, open, defaultOpen = false, onOpenChange, trigger, children }: DropdownMenuProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = open ?? internal;
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<'first' | 'last' | null>(null);

  function setOpen(next: boolean) {
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  }
  function menuItems() {
    const panel = panelRef.current;
    return enabledIn(panel, '[role^="menuitem"]').filter((el) => el.closest('[role="menu"]') === panel);
  }
  function close(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) (triggerRef.current?.firstElementChild as HTMLElement | null)?.focus();
  }

  useDismiss(isOpen, (reason) => close(reason === 'escape'), [rootRef]);

  useLayoutEffect(() => {
    if (!isOpen || !pendingFocus.current) return;
    const items = menuItems();
    (pendingFocus.current === 'last' ? items[items.length - 1] : items[0])?.focus();
    pendingFocus.current = null;
  }, [isOpen]);

  function handleTriggerClick(event: MouseEvent) {
    if (isValidElement<TriggerProps>(trigger)) trigger.props.onClick?.(event);
    if (isOpen) { close(false); return; }
    pendingFocus.current = 'first';
    setOpen(true);
  }
  function handleTriggerKeyDown(event: KeyboardEvent) {
    if (isValidElement<TriggerProps>(trigger)) trigger.props.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      pendingFocus.current = event.key === 'ArrowUp' ? 'last' : 'first';
      if (isOpen) { const items = menuItems(); (event.key === 'ArrowUp' ? items[items.length - 1] : items[0])?.focus(); pendingFocus.current = null; } else setOpen(true);
    }
  }
  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Tab') { close(false); return; }
    const items = menuItems();
    const active = items.findIndex((el) => el === document.activeElement || el.contains(document.activeElement));
    const to = roveIndex(event.key, active, items.length, { orientation: 'vertical' });
    if (to === null) return;
    event.preventDefault();
    items[to]?.focus();
  }

  const aria = { 'aria-haspopup': 'menu' as const, 'aria-expanded': isOpen, 'aria-controls': isOpen ? menuId : undefined };
  const triggerNode = isValidElement<TriggerProps>(trigger)
    ? cloneElement(trigger, { ...aria, onClick: handleTriggerClick, onKeyDown: handleTriggerKeyDown } as TriggerProps)
    : <span role="button" tabIndex={0} {...aria} onClick={handleTriggerClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTriggerClick(e as unknown as MouseEvent); } else handleTriggerKeyDown(e); }} className="cieo-dropdown-menu-trigger-fallback">{trigger}</span>;
  return (
    <div ref={rootRef} className="cieo cieo-dropdown-menu">
      <span ref={triggerRef} className="cieo-dropdown-menu-trigger">{triggerNode}</span>
      {isOpen ? (
        <DropdownMenuContext.Provider value={{ close: () => close(true) }}>
          <div ref={panelRef} id={menuId} role="menu" aria-label={label} onKeyDown={handlePanelKeyDown} className="cieo-dropdown-menu-panel">{children}</div>
        </DropdownMenuContext.Provider>
      ) : null}
    </div>
  );
}
