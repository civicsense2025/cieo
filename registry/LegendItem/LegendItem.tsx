// src/primitives/LegendItem/LegendItem.tsx
'use client';
import type { CSSProperties, ReactNode } from 'react';
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
  const ownedStyle = { '--cieo-legend': color } as CSSProperties;
  return (<span className="cieo cieo-p-legend-item" style={ownedStyle} {...customizePart(slotProps?.root, "cieo cieo-p-legend-item", ownedStyle, className)}>{children}</span>);
}
