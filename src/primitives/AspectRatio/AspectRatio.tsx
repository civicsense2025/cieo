// src/primitives/AspectRatio/AspectRatio.tsx
'use client';
/* AspectRatio. Ratio box for media: the box keeps the ratio, the child fills it. Host owns the media; this owns the ratio only. */
import type { ReactNode } from 'react';

export interface AspectRatioProps {
  /** Box ratio as CSS, e.g. '16/9'. Required. */
  ratio: string;
  children: ReactNode;
}

export function AspectRatio({ ratio, children }: AspectRatioProps) {
  return (
    <div style={{ aspectRatio: ratio }} className="cieo cieo-aspect-ratio">
      {children}
    </div>
  );
}
