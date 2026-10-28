// src/primitives/Layout/Layout.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Layout. App frame: header, content, footer in rows. Compose with LayoutHeader, LayoutContent, LayoutFooter; this owns the frame only. */
import type { ReactNode } from 'react';

export interface LayoutProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  children: ReactNode;
}

export function Layout({ className, slotProps, children }: LayoutProps) {
  return (
    <div className="cieo cieo-layout" {...customizePart(slotProps?.root, "cieo cieo-layout", undefined, className)}>
      {children}
    </div>
  );
}
