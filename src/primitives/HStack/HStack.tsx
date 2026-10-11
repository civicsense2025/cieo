// src/primitives/HStack/HStack.tsx
'use client';
/* HStack. Horizontal row with one gap between every child. For toolbars and action rows, not page grids. */
import type { ReactNode } from 'react';

export interface HStackProps {
  /** Gap between children. Defaults to 'md'. */
  gap?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function HStack({ gap = 'md', children }: HStackProps) {
  return (
    <div data-gap={gap} className="cieo cieo-h-stack">
      {children}
    </div>
  );
}
