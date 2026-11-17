// src/primitives/BlockPanel/BlockPanel.tsx
'use client';
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* BlockPanel. Twin of CieoUI BlockPanel. One per section. */
export interface BlockPanelProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  tone?: 'block' | 'surface' | 'accent';
  children: ReactNode;
}
export function BlockPanel({ className, slotProps, tone = 'block', children }: BlockPanelProps) {
  return (<section {...customizePart(slotProps?.root, "cieo cieo-p-block-panel", undefined, className)} data-tone={tone}>{children}</section>);
}
