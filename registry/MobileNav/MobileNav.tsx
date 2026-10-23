// src/primitives/MobileNav/MobileNav.tsx
'use client';
/* MobileNav. Drawer nav; renders null when closed. Escape calls onClose; host owns open state. */
import type { ReactNode } from 'react';
import { useDismiss } from '../../react/index.js';

export interface MobileNavProps {
  /** Accessible name for the drawer nav. Required. */
  label: string;
  /** Whether the drawer is open. Defaults to false. */
  open?: boolean;
  /** Close handler (e.g. close button, scrim). */
  onClose?: () => void;
  children: ReactNode;
}

export function MobileNav({ label, open = false, onClose, children }: MobileNavProps) {
  useDismiss(open, () => onClose?.(), [], { outside: false });
  if (!open) return null;
  return (
    <div className="cieo cieo-mobile-nav">
      <nav aria-label={label}>{children}</nav>
      {onClose ? (
        <button type="button" aria-label="Close navigation" onClick={onClose}>
          Close
        </button>
      ) : null}
    </div>
  );
}
