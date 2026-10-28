// src/primitives/GridSpan/GridSpan.tsx
'use client';
/* GridSpan. Grid item that spans N columns. Must live inside a Grid; this owns the span only. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface GridSpanProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Columns spanned (1-12). Required. */
  span: number;
  children: ReactNode;
}

export function GridSpan({ className, slotProps, span, children }: GridSpanProps) {
  return (
    <div data-span={span} className="cieo cieo-grid-span" {...customizePart(slotProps?.root, "cieo cieo-grid-span", undefined, className)}>
      {children}
    </div>
  );
}
