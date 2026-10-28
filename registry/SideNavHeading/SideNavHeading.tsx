// src/primitives/SideNavHeading/SideNavHeading.tsx
'use client';
/* SideNavHeading. Rail heading; hidden when the rail is collapsed. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface SideNavHeadingProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  children: ReactNode;
}

export function SideNavHeading({ className, slotProps, children }: SideNavHeadingProps) {
  return <h2 className="cieo cieo-side-nav-heading" {...customizePart(slotProps?.root, "cieo cieo-side-nav-heading", undefined, className)}>{children}</h2>;
}
