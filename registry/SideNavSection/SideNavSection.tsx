// src/primitives/SideNavSection/SideNavSection.tsx
'use client';
/* SideNavSection. Optionally labelled group of rail links. */
import type { ReactNode } from 'react';

export interface SideNavSectionProps {
  /** Accessible name for the group. */
  label?: string;
  children: ReactNode;
}

export function SideNavSection({ label, children }: SideNavSectionProps) {
  return (
    <div role="group" aria-label={label} className="cieo cieo-side-nav-section">
      {children}
    </div>
  );
}
