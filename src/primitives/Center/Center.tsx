// src/primitives/Center/Center.tsx
'use client';
/* Center. Centered content column with a max width. Host owns the content; this owns centering only. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface CenterProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Max inline width of the column. Defaults to '60rem'. */
  maxWidth?: string;
  children: ReactNode;
}

export function Center({ className, slotProps, maxWidth = '60rem', children }: CenterProps) {
  return (
    <div style={{ maxWidth }} className="cieo cieo-center" {...customizePart(slotProps?.root, "cieo cieo-center", { maxWidth }, className)}>
      {children}
    </div>
  );
}
