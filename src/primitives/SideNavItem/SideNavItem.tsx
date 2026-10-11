// src/primitives/SideNavItem/SideNavItem.tsx
'use client';
/* SideNavItem. Single link in the side rail; marks the current page. */
import type { ReactNode } from 'react';

export interface SideNavItemProps {
  /** Link target. Required. */
  href: string;
  /** Current page state; renders aria-current=page. Defaults to false. */
  current?: boolean;
  children: ReactNode;
}

export function SideNavItem({ href, current = false, children }: SideNavItemProps) {
  return (
    <a href={href} aria-current={current ? 'page' : undefined} className="cieo cieo-side-nav-item">
      {children}
    </a>
  );
}
