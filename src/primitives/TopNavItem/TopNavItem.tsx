// src/primitives/TopNavItem/TopNavItem.tsx
'use client';
/* TopNavItem. Single link in the top nav; marks the current page. */
import type { ReactNode } from 'react';

export interface TopNavItemProps {
  /** Link target. Required. */
  href: string;
  /** Current page state; renders aria-current=page. Defaults to false. */
  current?: boolean;
  children: ReactNode;
}

export function TopNavItem({ href, current = false, children }: TopNavItemProps) {
  return (
    <a href={href} aria-current={current ? 'page' : undefined} className="cieo cieo-top-nav-item">
      {children}
    </a>
  );
}
