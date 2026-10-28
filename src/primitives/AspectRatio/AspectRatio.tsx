// src/primitives/AspectRatio/AspectRatio.tsx
'use client';
/* AspectRatio. Ratio box for media: the box keeps the ratio, the child fills it. Host owns the media; this owns the ratio only. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface AspectRatioProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Box ratio as CSS, e.g. '16/9'. Required. */
  ratio: string;
  children: ReactNode;
}

export function AspectRatio({ className, slotProps, ratio, children }: AspectRatioProps) {
  return (
    <div style={{ aspectRatio: ratio }} className="cieo cieo-aspect-ratio" {...customizePart(slotProps?.root, "cieo cieo-aspect-ratio", { aspectRatio: ratio }, className)}>
      {children}
    </div>
  );
}
