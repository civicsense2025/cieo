// src/primitives/TopNavMegaMenu/TopNavMegaMenu.tsx
'use client';
/* TopNavMegaMenu. Controlled disclosure panel below a trigger. Panel stacks below; no flip. */
import type { ReactNode } from 'react';
import { useState } from 'react';

export interface TopNavMegaMenuProps {
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

export function TopNavMegaMenu({ trigger, open, defaultOpen = false, onOpenChange, children }: TopNavMegaMenuProps) {
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  function toggle() {
    const next = !isOpen;
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  }
  return (
    <div data-open={isOpen} className="cieo cieo-top-nav-mega-menu">
      <button type="button" aria-expanded={isOpen} onClick={toggle}>
        {trigger}
      </button>
      {isOpen ? <div className="cieo-top-nav-mega-menu-panel">{children}</div> : null}
    </div>
  );
}
