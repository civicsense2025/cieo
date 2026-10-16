// src/primitives/Popover/Popover.tsx
'use client';
/* Popover. Disclosure shell: trigger plus a simple absolute panel below it. Escape and outside press close it; host owns edge positioning. */
import { cloneElement, isValidElement, useId, useRef, useState, type ReactNode } from 'react';
import { useDismiss } from '../../react/index.js';

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
  const panelId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const set = (next: boolean) => {
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };
  useDismiss(visible, (reason) => {
    set(false);
    if (reason === 'escape') (triggerRef.current?.querySelector('button,a[href],[tabindex]') as HTMLElement | null)?.focus();
  }, [rootRef]);
  const aria = { 'aria-haspopup': 'dialog' as const, 'aria-expanded': visible, 'aria-controls': visible ? panelId : undefined };
  const triggerNode = isValidElement<Record<string, unknown>>(trigger) ? cloneElement(trigger, aria) : trigger;
  return (
    <span ref={rootRef} className="cieo cieo-p-popover">
      <span ref={triggerRef} onClick={() => set(!visible)} className="cieo-p-popover-trigger">
        {triggerNode}
      </span>
      {visible ? <span id={panelId} className="cieo-p-popover-panel">{children}</span> : null}
    </span>
  );
}
