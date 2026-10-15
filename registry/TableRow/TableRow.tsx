'use client';
/* TableRow. <tr> with optional selected highlight. Host owns which rows are selected; this owns row rendering only. */
import type { ReactNode } from 'react';

export interface TableRowProps {
  /** Selected state; adds data-selected and a highlight. Defaults to false. */
  selected?: boolean;
  /** Cells for the row. Required. */
  children: ReactNode;
}

export function TableRow({ selected = false, children }: TableRowProps) {
  return (
    <tr data-selected={selected} aria-selected={selected} className="cieo cieo-table-row">
      {children}
    </tr>
  );
}
