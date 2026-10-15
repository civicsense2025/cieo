// src/primitives/TopNavHeading/TopNavHeading.tsx
'use client';
/* TopNavHeading. Brand slot in the top nav; links home by default. */
import type { ReactNode } from 'react';

export interface TopNavHeadingProps {
  /** Brand link target. Defaults to /. */
  href?: string;
  children: ReactNode;
}

export function TopNavHeading({ href = '/', children }: TopNavHeadingProps) {
  return (
    <a href={href} className="cieo cieo-top-nav-heading">
      {children}
    </a>
  );
}
