'use client';
/* TableCell. <td> data cell with standard padding. Host supplies cell content; this owns cell rendering only. */
import type { ReactNode } from 'react';

export interface TableCellProps {
  /** Cell content. Required. */
  children: ReactNode;
}

export function TableCell({ children }: TableCellProps) {
  return (
    <td className="cieo cieo-table-cell">
      {children}
    </td>
  );
}
