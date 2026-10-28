// src/primitives/Grid/Grid.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Grid. Twelve-column page grid: GridSpan children take their spans. Host owns the content; this owns columns + gap only. */
import type { ReactNode } from 'react';

export interface GridProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Column count (1-12). Defaults to 12. */
  columns?: number;
  /** Gap between cells. Defaults to 'md'. */
  gap?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Grid({ className, slotProps, columns = 12, gap = 'md', children }: GridProps) {
  return (
    <div data-columns={columns} data-gap={gap} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} className="cieo cieo-grid" {...customizePart(slotProps?.root, "cieo cieo-grid", { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }, className)}>
      {children}
    </div>
  );
}
