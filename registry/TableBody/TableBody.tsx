'use client';
/* TableBody. <tbody> wrapper for data rows. Host supplies TableRow rows; this owns body grouping semantics only. */
import type { ReactNode } from 'react';

export interface TableBodyProps {
  /** Data rows. Required. */
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="cieo cieo-table-body">
      {children}
    </tbody>
  );
}
