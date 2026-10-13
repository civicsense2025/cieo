// src/primitives/LayoutFooter/LayoutFooter.tsx
'use client';
/* LayoutFooter. App frame footer landmark. Unstyled by design; the host owns footer content. */
import type { ReactNode } from 'react';

export interface LayoutFooterProps {
  /** Accessible name for the footer landmark. Optional. */
  label?: string;
  children: ReactNode;
}

export function LayoutFooter({ label, children }: LayoutFooterProps) {
  return (
    <footer aria-label={label} className="cieo cieo-layout-footer">
      {children}
    </footer>
  );
}
