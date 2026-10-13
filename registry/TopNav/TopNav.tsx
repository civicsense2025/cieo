// src/primitives/TopNav/TopNav.tsx
'use client';
/* TopNav. Sticky site header with a labelled primary nav. Host supplies brand, items, and menus. */
import type { ReactNode } from 'react';

export interface TopNavProps {
  /** Accessible name for the primary nav. Defaults to Primary. */
  label?: string;
  children: ReactNode;
}

export function TopNav({ label = 'Primary', children }: TopNavProps) {
  return (
    <header className="cieo cieo-top-nav">
      <nav aria-label={label}>{children}</nav>
    </header>
  );
}
