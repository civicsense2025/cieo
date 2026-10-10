// src/primitives/ScrollableArea/ScrollableArea.tsx
'use client';
/* ScrollableArea. Overflow container with a direction. Host owns what scrolls; this owns the scroll axes only. */
import type { ReactNode } from 'react';

export interface ScrollableAreaProps {
  /** Scroll axes allowed. Defaults to 'vertical'. */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** Max block height before scrolling, e.g. '16rem'. Optional. */
  maxHeight?: string;
  children: ReactNode;
}

export function ScrollableArea({ orientation = 'vertical', maxHeight, children }: ScrollableAreaProps) {
  return (
    <div data-orientation={orientation} style={{ maxHeight }} className="cieo cieo-scrollable-area">
      {children}
    </div>
  );
}
