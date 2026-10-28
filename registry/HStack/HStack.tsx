// src/primitives/HStack/HStack.tsx
'use client';
/* HStack. Horizontal row with one gap between every child. For toolbars and action rows, not page grids. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface HStackProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Gap between children. Defaults to 'md'. */
  gap?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function HStack({ className, slotProps, gap = 'md', children }: HStackProps) {
  return (
    <div data-gap={gap} className="cieo cieo-h-stack" {...customizePart(slotProps?.root, "cieo cieo-h-stack", undefined, className)}>
      {children}
    </div>
  );
}
