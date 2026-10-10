// src/primitives/NavIcon/NavIcon.tsx
'use client';
/* NavIcon. Icon slot in nav rows; inherits icon sizing, so it ships no CSS. */
import type { ReactNode } from 'react';

export interface NavIconProps {
  /** Icon size. Defaults to md. */
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function NavIcon({ size = 'md', children }: NavIconProps) {
  return (
    <span aria-hidden="true" data-size={size} className="cieo cieo-nav-icon">
      {children}
    </span>
  );
}
