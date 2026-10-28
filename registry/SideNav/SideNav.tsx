// src/primitives/SideNav/SideNav.tsx
'use client';
/* SideNav. Section rail nav; collapsed narrows to an icon rail. Host owns the collapsed state. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import type { ReactNode } from 'react';

export interface SideNavProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Accessible name for the rail. Defaults to Sections. */
  label?: string;
  /** Narrow icon-rail mode. Defaults to false. */
  collapsed?: boolean;
  children: ReactNode;
}

export function SideNav({ label = 'Sections', collapsed = false, children, className, slotProps }: SideNavProps) {
  return (
    <nav aria-label={label} data-collapsed={collapsed} className="cieo cieo-side-nav" {...customizePart(slotProps?.root, "cieo cieo-side-nav", undefined, className)}>
      {children}
    </nav>
  );
}
