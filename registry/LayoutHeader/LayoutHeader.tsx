// src/primitives/LayoutHeader/LayoutHeader.tsx
'use client';
/* LayoutHeader. App frame header landmark. Unstyled by design; the host owns branding and nav content. */
import type { ReactNode } from 'react';

export interface LayoutHeaderProps {
  /** Accessible name for the header landmark. Optional. */
  label?: string;
  children: ReactNode;
}

export function LayoutHeader({ label, children }: LayoutHeaderProps) {
  return (
    <header aria-label={label} className="cieo cieo-layout-header">
      {children}
    </header>
  );
}
