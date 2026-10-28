'use client';
/* TableCell. <td> data cell with standard padding. Host supplies cell content; this owns cell rendering only. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface TableCellProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Cell content. Required. */
  children: ReactNode;
}

export function TableCell({ className, slotProps, children }: TableCellProps) {
  return (
    <td className="cieo cieo-table-cell" {...customizePart(slotProps?.root, "cieo cieo-table-cell", undefined, className)}>
      {children}
    </td>
  );
}
