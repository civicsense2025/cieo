'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* TableBody. <tbody> wrapper for data rows. Host supplies TableRow rows; this owns body grouping semantics only. */
import type { ReactNode } from 'react';

export interface TableBodyProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Data rows. Required. */
  children: ReactNode;
}

export function TableBody({ className, slotProps, children }: TableBodyProps) {
  return (
    <tbody className="cieo cieo-table-body" {...customizePart(slotProps?.root, "cieo cieo-table-body", undefined, className)}>
      {children}
    </tbody>
  );
}
