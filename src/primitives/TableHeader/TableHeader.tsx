'use client';
/* TableHeader. <thead> wrapper for column header rows. Host supplies TableHeaderCell cells; this owns header grouping semantics only. */
import type { ReactNode } from 'react';

export interface TableHeaderProps {
  /** Header rows. Required. */
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="cieo cieo-table-header">
      {children}
    </thead>
  );
}
