// src/primitives/SideNavItem/SideNavItem.tsx
'use client';
/* SideNavItem. Single link in the side rail; marks the current page. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface SideNavItemProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Link target. Required. */
  href: string;
  /** Current page state; renders aria-current=page. Defaults to false. */
  current?: boolean;
  children: ReactNode;
}

export function SideNavItem({ className, slotProps, href, current = false, children }: SideNavItemProps) {
  return (
    <a href={href} aria-current={current ? 'page' : undefined} className="cieo cieo-side-nav-item" {...customizePart(slotProps?.root, "cieo cieo-side-nav-item", undefined, className)}>
      {children}
    </a>
  );
}
