// src/primitives/MobileNav/MobileNav.tsx
'use client';
/* MobileNav. Drawer nav; renders null when closed. Escape calls onClose; host owns open state. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import type { ReactNode } from 'react';
import { useDismiss } from '../../react/index.js';

export interface MobileNavProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; navigation?: PrimitivePartProps; close?: PrimitivePartProps };
  /** Accessible name for the drawer nav. Required. */
  label: string;
  /** Whether the drawer is open. Defaults to false. */
  open?: boolean;
  /** Close handler (e.g. close button, scrim). */
  onClose?: () => void;
  children: ReactNode;
}

export function MobileNav({ label, open = false, onClose, children, className, slotProps }: MobileNavProps) {
  useDismiss(open, () => onClose?.(), [], { outside: false });
  if (!open) return null;
  return (
    <div className="cieo cieo-mobile-nav" {...customizePart(slotProps?.root, "cieo cieo-mobile-nav", undefined, className)}>
      <nav aria-label={label} {...customizePart(slotProps?.navigation, undefined, undefined)}>{children}</nav>
      {onClose ? (
        <button type="button" aria-label="Close navigation" onClick={onClose} {...customizePart(slotProps?.close, undefined, undefined)}>
          Close
        </button>
      ) : null}
    </div>
  );
}
