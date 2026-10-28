// src/primitives/LayoutHeader/LayoutHeader.tsx
'use client';
/* LayoutHeader. App frame header landmark. Unstyled by design; the host owns branding and nav content. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface LayoutHeaderProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the header landmark. Optional. */
  label?: string;
  children: ReactNode;
}

export function LayoutHeader({ className, slotProps, label, children }: LayoutHeaderProps) {
  return (
    <header aria-label={label} className="cieo cieo-layout-header" {...customizePart(slotProps?.root, "cieo cieo-layout-header", undefined, className)}>
      {children}
    </header>
  );
}
