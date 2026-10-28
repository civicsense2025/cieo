// src/primitives/TopNavMenu/TopNavMenu.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* TopNavMenu. Labelled group of top-nav links. Host supplies the links. */
import type { ReactNode } from 'react';

export interface TopNavMenuProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the group (e.g. "Products"). Required. */
  label: string;
  children: ReactNode;
}

export function TopNavMenu({ className, slotProps, label, children }: TopNavMenuProps) {
  return (
    <div role="group" aria-label={label} className="cieo cieo-top-nav-menu" {...customizePart(slotProps?.root, "cieo cieo-top-nav-menu", undefined, className)}>
      {children}
    </div>
  );
}
