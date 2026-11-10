// src/primitives/LegendItem/LegendItem.tsx
'use client';
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* LegendItem. Swatch plus words; colour never stands alone. */
export interface LegendItemProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  color: string;
  children: ReactNode;
}
export function LegendItem({ className, slotProps, color, children }: LegendItemProps) {
  return (<span {...customizePart(slotProps?.root, "cieo cieo-p-legend-item", undefined, className)} style={{ ['--cieo-legend' as string]: color }}>{children}</span>);
}
