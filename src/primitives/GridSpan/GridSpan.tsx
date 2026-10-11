// src/primitives/GridSpan/GridSpan.tsx
'use client';
/* GridSpan. Grid item that spans N columns. Must live inside a Grid; this owns the span only. */
import type { ReactNode } from 'react';

export interface GridSpanProps {
  /** Columns spanned (1-12). Required. */
  span: number;
  children: ReactNode;
}

export function GridSpan({ span, children }: GridSpanProps) {
  return (
    <div data-span={span} className="cieo cieo-grid-span">
      {children}
    </div>
  );
}
