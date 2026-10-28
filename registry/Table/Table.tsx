'use client';
/* Table. Real <table> wrapper with an accessible name. Host owns data operations (sorting, filtering, pagination, selection); this owns table rendering semantics only. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import type { ReactNode } from 'react';

export interface TableProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Accessible name for the table. Required. */
  label: string;
  /** Header, body, and footer parts. Required. */
  children: ReactNode;
}

export function Table({ label, children, className, slotProps }: TableProps) {
  return (
    <table aria-label={label} className="cieo cieo-table" {...customizePart(slotProps?.root, "cieo cieo-table", undefined, className)}>
      {children}
    </table>
  );
}
