'use client';
/* TableRow. <tr> with optional selected highlight. Host owns which rows are selected; this owns row rendering only. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface TableRowProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Selected state; adds data-selected and a highlight. Defaults to false. */
  selected?: boolean;
  /** Cells for the row. Required. */
  children: ReactNode;
}

export function TableRow({ className, slotProps, selected = false, children }: TableRowProps) {
  return (
    <tr data-selected={selected} aria-selected={selected} className="cieo cieo-table-row" {...customizePart(slotProps?.root, "cieo cieo-table-row", undefined, className)}>
      {children}
    </tr>
  );
}
