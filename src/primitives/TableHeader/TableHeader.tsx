'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* TableHeader. <thead> wrapper for column header rows. Host supplies TableHeaderCell cells; this owns header grouping semantics only. */
import type { ReactNode } from 'react';

export interface TableHeaderProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Header rows. Required. */
  children: ReactNode;
}

export function TableHeader({ className, slotProps, children }: TableHeaderProps) {
  return (
    <thead className="cieo cieo-table-header" {...customizePart(slotProps?.root, "cieo cieo-table-header", undefined, className)}>
      {children}
    </thead>
  );
}
