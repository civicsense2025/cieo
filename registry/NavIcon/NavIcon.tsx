// src/primitives/NavIcon/NavIcon.tsx
'use client';
/* NavIcon. Icon slot in nav rows; inherits icon sizing, so it ships no CSS. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface NavIconProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Icon size. Defaults to md. */
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function NavIcon({ className, slotProps, size = 'md', children }: NavIconProps) {
  return (
    <span aria-hidden="true" data-size={size} className="cieo cieo-nav-icon" {...customizePart(slotProps?.root, "cieo cieo-nav-icon", undefined, className)}>
      {children}
    </span>
  );
}
