// src/primitives/LayoutPanel/LayoutPanel.tsx
'use client';
/* LayoutPanel. Named side panel (complementary rail). Label is required; side picks the edge. Host owns panel content. */
import type { ReactNode } from 'react';

export interface LayoutPanelProps {
  /** Accessible name for the complementary landmark. Required. */
  label: string;
  /** Edge the panel sits on. Defaults to 'right'. */
  side?: 'left' | 'right';
  children: ReactNode;
}

export function LayoutPanel({ label, side = 'right', children }: LayoutPanelProps) {
  return (
    <aside aria-label={label} data-side={side} className="cieo cieo-layout-panel">
      {children}
    </aside>
  );
}
