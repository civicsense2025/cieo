// src/primitives/DropdownMenu/DropdownMenu.tsx
'use client';
/* DropdownMenu. Menu shell with controllable open state and spring enter/exit presence. */
import {
  cloneElement,
  createContext,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { enabledIn, roveIndex, useDismiss, usePresence } from '../../react/index.js';
import { useControllableState } from '../../state/react.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface DropdownMenuContextValue {
  /** Closes the menu and returns focus to the trigger. */
  close: () => void;
}
export const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export interface DropdownMenuProps {
  className?: string;
  slotProps?: { triggerFallback?: PrimitivePartProps; root?: PrimitivePartProps; trigger?: PrimitivePartProps; panel?: PrimitivePartProps };
  /** Accessible name for the menu (e.g. "File actions"). Required. */
  label: string;
  /** Open state when controlled. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to false. */
  defaultOpen?: boolean;
  /** Called with the next open state. */
  onOpenChange?: (open: boolean) => void;
  /** False renders the end state instantly. Defaults to true. */
  motion?: boolean;
  /** Opener control (usually a Button). Exactly one. */
  trigger: ReactNode;
  children: ReactNode;
}

type TriggerProps = { onClick?: (event: MouseEvent) => void; onKeyDown?: (event: KeyboardEvent) => void };

export function DropdownMenu({
  className,
  slotProps,
  label,
  open,
  defaultOpen = false,
  onOpenChange,
  motion,
  trigger,
  children,
}: DropdownMenuProps) {
  const [isOpen, setInternal] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
  });
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const pendingFocus = useRef<'first' | 'last' | null>(null);
  const { mounted, ref: panelRef } = usePresence<HTMLDivElement>(isOpen, {
    disabled: motion === false,
    from: { x: 0, y: -4, scale: 0.98, opacity: 0, blur: 0 },
  });

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
    if (isOpen) {
      close(false);
      return;
    }
    pendingFocus.current = 'first';
    setOpen(true);
  }
  function handleTriggerKeyDown(event: KeyboardEvent) {
    if (isValidElement<TriggerProps>(trigger)) trigger.props.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      pendingFocus.current = event.key === 'ArrowUp' ? 'last' : 'first';
      if (isOpen) {
        const items = menuItems();
        (event.key === 'ArrowUp' ? items[items.length - 1] : items[0])?.focus();
        pendingFocus.current = null;
      } else setOpen(true);
    }
  }
  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Tab') {
      close(false);
      return;
    }
    const items = menuItems();
    const active = items.findIndex((el) => el === document.activeElement || el.contains(document.activeElement));
    const to = roveIndex(event.key, active, items.length, { orientation: 'vertical' });
    if (to === null) return;
    event.preventDefault();
    items[to]?.focus();
  }

  const aria = { 'aria-haspopup': 'menu' as const, 'aria-expanded': isOpen, 'aria-controls': mounted ? menuId : undefined };
  const triggerNode = isValidElement<TriggerProps>(trigger) ? (
    cloneElement(trigger, { ...aria, onClick: handleTriggerClick, onKeyDown: handleTriggerKeyDown } as TriggerProps)
  ) : (
    <span
      role="button"
      tabIndex={0}
      {...aria}
      onClick={handleTriggerClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTriggerClick(e as unknown as MouseEvent);
        } else handleTriggerKeyDown(e);
      }}
      className="cieo-dropdown-menu-trigger-fallback"
      {...customizePart(slotProps?.triggerFallback, 'cieo-dropdown-menu-trigger-fallback')}
    >
      {trigger}
    </span>
  );
  return (
    <div ref={rootRef} className="cieo cieo-dropdown-menu" {...customizePart(slotProps?.root, 'cieo cieo-dropdown-menu', undefined, className)}>
      <span ref={triggerRef} className="cieo-dropdown-menu-trigger" {...customizePart(slotProps?.trigger, 'cieo-dropdown-menu-trigger')}>
        {triggerNode}
      </span>
      {mounted ? (
        <DropdownMenuContext.Provider value={{ close: () => close(true) }}>
          <div
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-label={label}
            aria-hidden={!isOpen || undefined}
            onKeyDown={handlePanelKeyDown}
            className="cieo-dropdown-menu-panel"
            {...customizePart(slotProps?.panel, 'cieo-dropdown-menu-panel')}
          >
            {children}
          </div>
        </DropdownMenuContext.Provider>
      ) : null}
    </div>
  );
}
