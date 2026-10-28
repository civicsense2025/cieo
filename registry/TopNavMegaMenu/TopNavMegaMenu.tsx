// src/primitives/TopNavMegaMenu/TopNavMegaMenu.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* TopNavMegaMenu. Disclosure panel below a trigger. Escape and outside press close it; panel stacks below, no flip. */
import { useId, useRef, useState, type ReactNode } from 'react';
import { useDismiss } from '../../react/index.js';

export interface TopNavMegaMenuProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; panel?: PrimitivePartProps };

  /** Trigger content (e.g. "Products"). Required. */
  trigger: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial state. Defaults to false. */
  defaultOpen?: boolean;
  /** Open-state change handler. */
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function TopNavMegaMenu({ className, slotProps, trigger, open, defaultOpen = false, onOpenChange, children }: TopNavMegaMenuProps) {
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  function set(next: boolean) {
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  }
  useDismiss(isOpen, (reason) => {
    set(false);
    if (reason === 'escape') buttonRef.current?.focus();
  }, [rootRef]);
  return (
    <div ref={rootRef} data-open={isOpen} className="cieo cieo-top-nav-mega-menu" {...customizePart(slotProps?.root, "cieo cieo-top-nav-mega-menu", undefined, className)}>
      <button ref={buttonRef} type="button" aria-expanded={isOpen} aria-controls={isOpen ? panelId : undefined} onClick={() => set(!isOpen)}>
        {trigger}
      </button>
      {isOpen ? <div id={panelId} className="cieo-top-nav-mega-menu-panel" {...customizePart(slotProps?.panel, "cieo-top-nav-mega-menu-panel")}>{children}</div> : null}
    </div>
  );
}
