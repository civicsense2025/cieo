'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* TableFooter. <tfoot> wrapper for summary rows. Host supplies TableRow rows; this owns footer grouping semantics only. */
import type { ReactNode } from 'react';

export interface TableFooterProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Summary rows. Required. */
  children: ReactNode;
}

export function TableFooter({ className, slotProps, children }: TableFooterProps) {
  return (
    <tfoot className="cieo cieo-table-footer" {...customizePart(slotProps?.root, "cieo cieo-table-footer", undefined, className)}>
      {children}
    </tfoot>
  );
}
