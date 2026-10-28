'use client';
/* ListItem. One row: consistent padding with a divider. Host owns row content and actions. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export interface ListItemProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
 children: ReactNode; }
export function ListItem({ className, slotProps, children }: ListItemProps) {
  return (<li className="cieo-p-list-item" {...customizePart(slotProps?.root, "cieo-p-list-item", undefined, className)}>{children}</li>);
}
