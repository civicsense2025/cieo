// src/primitives/TopNav/TopNav.tsx
'use client';
/* TopNav. Sticky site header with a labelled primary nav. Host supplies brand, items, and menus. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import type { ReactNode } from 'react';

export interface TopNavProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; navigation?: PrimitivePartProps };
  /** Accessible name for the primary nav. Defaults to Primary. */
  label?: string;
  children: ReactNode;
}

export function TopNav({ label = 'Primary', children, className, slotProps }: TopNavProps) {
  return (
    <header className="cieo cieo-top-nav" {...customizePart(slotProps?.root, "cieo cieo-top-nav", undefined, className)}>
      <nav aria-label={label} {...customizePart(slotProps?.navigation, undefined, undefined)}>{children}</nav>
    </header>
  );
}
