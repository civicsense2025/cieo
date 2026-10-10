// src/primitives/SideNavHeading/SideNavHeading.tsx
'use client';
/* SideNavHeading. Rail heading; hidden when the rail is collapsed. */
import type { ReactNode } from 'react';

export interface SideNavHeadingProps {
  children: ReactNode;
}

export function SideNavHeading({ children }: SideNavHeadingProps) {
  return <h2 className="cieo cieo-side-nav-heading">{children}</h2>;
}
