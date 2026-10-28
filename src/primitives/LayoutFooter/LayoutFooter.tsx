// src/primitives/LayoutFooter/LayoutFooter.tsx
'use client';
/* LayoutFooter. App frame footer landmark. Unstyled by design; the host owns footer content. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface LayoutFooterProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the footer landmark. Optional. */
  label?: string;
  children: ReactNode;
}

export function LayoutFooter({ className, slotProps, label, children }: LayoutFooterProps) {
  return (
    <footer aria-label={label} className="cieo cieo-layout-footer" {...customizePart(slotProps?.root, "cieo cieo-layout-footer", undefined, className)}>
      {children}
    </footer>
  );
}
