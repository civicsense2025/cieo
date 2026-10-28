'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Stack. Vertical rhythm for grouped content: one gap between every child. For cards and rows, not page grids. */
import type { ReactNode } from 'react';
export interface StackProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
 gap?: 'sm' | 'md' | 'lg'; children: ReactNode; }
export function Stack({ className, slotProps, gap = 'md', children }: StackProps) {
  return (<div data-gap={gap} className="cieo cieo-p-stack" {...customizePart(slotProps?.root, "cieo cieo-p-stack", undefined, className)}>{children}</div>);
}
