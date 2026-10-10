// src/primitives/TopNavMenu/TopNavMenu.tsx
'use client';
/* TopNavMenu. Labelled group of top-nav links. Host supplies the links. */
import type { ReactNode } from 'react';

export interface TopNavMenuProps {
  /** Accessible name for the group (e.g. "Products"). Required. */
  label: string;
  children: ReactNode;
}

export function TopNavMenu({ label, children }: TopNavMenuProps) {
  return (
    <div role="group" aria-label={label} className="cieo cieo-top-nav-menu">
      {children}
    </div>
  );
}
