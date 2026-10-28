'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* List. Plain row collection with consistent dividers. Ordered when sequence matters. */
import type { ReactNode } from 'react';
export interface ListProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
 ordered?: boolean; label?: string; children: ReactNode; }
export function List({ className, slotProps, ordered = false, label, children }: ListProps) {
  const Tag = ordered ? 'ol' : 'ul';
  return (<Tag aria-label={label} className="cieo cieo-p-list" {...customizePart(slotProps?.root, "cieo cieo-p-list", undefined, className)}>{children}</Tag>);
}
