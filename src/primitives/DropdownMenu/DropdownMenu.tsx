// src/primitives/DropdownMenu/DropdownMenu.tsx
'use client';
/* DropdownMenu. Controlled menu shell. Host trigger opens it via onOpenChange; Escape and outside-click stay host-owned. */
import { cloneElement, isValidElement, useState, type MouseEvent, type ReactNode } from 'react';

export interface DropdownMenuProps {
  /** Accessible name for the menu (e.g. "File actions"). Required. */
  label: string;
  /** Open state when controlled. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to false. */
  defaultOpen?: boolean;
  /** Called with the next open state. Host trigger calls onOpenChange(true). */
  onOpenChange?: (open: boolean) => void;
  /** Opener control (usually a Button). Exactly one. */
  trigger: ReactNode;
  children: ReactNode;
}

export function DropdownMenu({ label, open, defaultOpen = false, onOpenChange, trigger, children }: DropdownMenuProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = open ?? internal;
  function handleTriggerClick(event: MouseEvent) {
    if (isValidElement<{ onClick?: (event: MouseEvent) => void }>(trigger)) {
      trigger.props.onClick?.(event);
    }
    if (open === undefined) setInternal(true);
    onOpenChange?.(true);
  }
  const triggerNode = isValidElement<{ onClick?: (event: MouseEvent) => void }>(trigger)
    ? cloneElement(trigger, { onClick: handleTriggerClick })
    : <span onClick={handleTriggerClick} className="cieo-dropdown-menu-trigger-fallback">{trigger}</span>;
  return (
    <div className="cieo cieo-dropdown-menu">
      <span className="cieo-dropdown-menu-trigger">{triggerNode}</span>
      {isOpen ? (<div role="menu" aria-label={label} className="cieo-dropdown-menu-panel">{children}</div>) : null}
    </div>
  );
}
