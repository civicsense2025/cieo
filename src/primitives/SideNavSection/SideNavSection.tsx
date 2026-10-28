// src/primitives/SideNavSection/SideNavSection.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* SideNavSection. Optionally labelled group of rail links. */
import type { ReactNode } from 'react';

export interface SideNavSectionProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the group. */
  label?: string;
  children: ReactNode;
}

export function SideNavSection({ className, slotProps, label, children }: SideNavSectionProps) {
  return (
    <div role="group" aria-label={label} className="cieo cieo-side-nav-section" {...customizePart(slotProps?.root, "cieo cieo-side-nav-section", undefined, className)}>
      {children}
    </div>
  );
}
