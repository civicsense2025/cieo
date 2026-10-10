// src/primitives/Popover/Popover.tsx
'use client';
/* Popover. Controlled disclosure shell: trigger plus a simple absolute panel below it. Host owns edge positioning and persistence. */
import { useState, type ReactNode } from 'react';

export interface PopoverProps {
  /** Trigger element that toggles the panel. Required slot. */
  trigger: ReactNode;
  /** Controlled open state. Optional. */
  open?: boolean;
  /** Uncontrolled initial state. Defaults to false. */
  defaultOpen?: boolean;
  /** Host open hook. Optional. */
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Popover({ trigger, open, defaultOpen = false, onOpenChange, children }: PopoverProps) {
  const [inner, setInner] = useState(defaultOpen);
  const visible = open ?? inner;
  const set = (next: boolean) => {
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };
  return (
    <span className="cieo cieo-p-popover">
      <span onClick={() => set(!visible)} className="cieo-p-popover-trigger">
        {trigger}
      </span>
      {visible ? <span className="cieo-p-popover-panel">{children}</span> : null}
    </span>
  );
}
