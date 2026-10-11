// src/primitives/LayoutContent/LayoutContent.tsx
'use client';
/* LayoutContent. App frame main landmark. Unstyled by design; the host owns page content. */
import type { ReactNode } from 'react';

export interface LayoutContentProps {
  /** Accessible name for the main landmark. Optional. */
  label?: string;
  children: ReactNode;
}

export function LayoutContent({ label, children }: LayoutContentProps) {
  return (
    <main aria-label={label} className="cieo cieo-layout-content">
      {children}
    </main>
  );
}
