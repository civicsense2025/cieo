// src/primitives/DropdownMenuSubMenu/DropdownMenuSubMenu.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* DropdownMenuSubMenu. Nested flyout inside a menu. CSS hover/focus-within reveals the panel; arrow keys move in and out. */
import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { enabledIn, roveIndex } from '../../react/index.js';
import { motionAttrs, type MotionProps } from '../motion.js';

export interface DropdownMenuSubMenuProps extends MotionProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; dropdownMenuSubmenuTrigger?: PrimitivePartProps; dropdownMenuSubmenuPanel?: PrimitivePartProps };

  /** Accessible name for the nested menu (e.g. "Export as"). Required. */
  label: string;
  children: ReactNode;
}

export function DropdownMenuSubMenu({ className, slotProps, label, children, motion, entering = 'fade', exiting = 'fade' }: DropdownMenuSubMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const items = () => enabledIn(panelRef.current, '[role^="menuitem"]').filter((el) => el.closest('[role="menu"]') === panelRef.current);
  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    items()[0]?.focus();
  }
  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft' || event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      triggerRef.current?.focus();
      return;
    }
    const list = items();
    const to = roveIndex(event.key, list.findIndex((el) => el === document.activeElement), list.length);
    if (to === null) return;
    event.preventDefault();
    event.stopPropagation();
    list[to]?.focus();
  }
  return (
    <div className="cieo cieo-dropdown-menu-submenu" {...motionAttrs({ motion, entering, exiting })} {...customizePart(slotProps?.root, "cieo cieo-dropdown-menu-submenu", undefined, className)}>
      <button ref={triggerRef} type="button" role="menuitem" aria-haspopup="menu" aria-label={label} onKeyDown={onTriggerKeyDown} className="cieo-dropdown-menu-submenu-trigger" {...customizePart(slotProps?.dropdownMenuSubmenuTrigger, "cieo-dropdown-menu-submenu-trigger")}>
        {label}
      </button>
      <div ref={panelRef} role="menu" aria-label={label} onKeyDown={onPanelKeyDown} className="cieo-dropdown-menu-submenu-panel" {...customizePart(slotProps?.dropdownMenuSubmenuPanel, "cieo-dropdown-menu-submenu-panel")}>
        {children}
      </div>
    </div>
  );
}
