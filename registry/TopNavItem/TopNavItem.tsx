// src/primitives/TopNavItem/TopNavItem.tsx
'use client';
/* TopNavItem. Single link in the top nav; marks the current page. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface TopNavItemProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Link target. Required. */
  href: string;
  /** Current page state; renders aria-current=page. Defaults to false. */
  current?: boolean;
  children: ReactNode;
}

export function TopNavItem({ className, slotProps, href, current = false, children }: TopNavItemProps) {
  return (
    <a href={href} aria-current={current ? 'page' : undefined} className="cieo cieo-top-nav-item" {...customizePart(slotProps?.root, "cieo cieo-top-nav-item", undefined, className)}>
      {children}
    </a>
  );
}
