'use client';
/* TableFooter. <tfoot> wrapper for summary rows. Host supplies TableRow rows; this owns footer grouping semantics only. */
import type { ReactNode } from 'react';

export interface TableFooterProps {
  /** Summary rows. Required. */
  children: ReactNode;
}

export function TableFooter({ children }: TableFooterProps) {
  return (
    <tfoot className="cieo cieo-table-footer">
      {children}
    </tfoot>
  );
}
