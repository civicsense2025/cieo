// src/primitives/LayoutContent/LayoutContent.tsx
'use client';
/* LayoutContent. App frame main landmark. Unstyled by design; the host owns page content. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface LayoutContentProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the main landmark. Optional. */
  label?: string;
  children: ReactNode;
}

export function LayoutContent({ className, slotProps, label, children }: LayoutContentProps) {
  return (
    <main aria-label={label} className="cieo cieo-layout-content" {...customizePart(slotProps?.root, "cieo cieo-layout-content", undefined, className)}>
      {children}
    </main>
  );
}
