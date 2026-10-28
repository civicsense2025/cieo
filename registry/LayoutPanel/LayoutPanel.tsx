// src/primitives/LayoutPanel/LayoutPanel.tsx
'use client';
/* LayoutPanel. Named side panel (complementary rail). Label is required; side picks the edge. Host owns panel content. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface LayoutPanelProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the complementary landmark. Required. */
  label: string;
  /** Edge the panel sits on. Defaults to 'right'. */
  side?: 'left' | 'right';
  children: ReactNode;
}

export function LayoutPanel({ className, slotProps, label, side = 'right', children }: LayoutPanelProps) {
  return (
    <aside aria-label={label} data-side={side} className="cieo cieo-layout-panel" {...customizePart(slotProps?.root, "cieo cieo-layout-panel", undefined, className)}>
      {children}
    </aside>
  );
}
