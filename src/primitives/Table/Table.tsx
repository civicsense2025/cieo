'use client';
/* Table. Real <table> wrapper with an accessible name. Host owns data operations (sorting, filtering, pagination, selection); this owns table rendering semantics only. */
import type { ReactNode } from 'react';

export interface TableProps {
  /** Accessible name for the table. Required. */
  label: string;
  /** Header, body, and footer parts. Required. */
  children: ReactNode;
}

export function Table({ label, children }: TableProps) {
  return (
    <table aria-label={label} className="cieo cieo-table">
      {children}
    </table>
  );
}
