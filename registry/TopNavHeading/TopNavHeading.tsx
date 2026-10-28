// src/primitives/TopNavHeading/TopNavHeading.tsx
'use client';
/* TopNavHeading. Brand slot in the top nav; links home by default. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface TopNavHeadingProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Brand link target. Defaults to /. */
  href?: string;
  children: ReactNode;
}

export function TopNavHeading({ className, slotProps, href = '/', children }: TopNavHeadingProps) {
  return (
    <a href={href} className="cieo cieo-top-nav-heading" {...customizePart(slotProps?.root, "cieo cieo-top-nav-heading", undefined, className)}>
      {children}
    </a>
  );
}
