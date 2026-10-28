'use client';
/* TableHeaderCell. Column or row header. A header with onSort renders a button in every state, including unsorted. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface TableHeaderCellProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; sortButton?: PrimitivePartProps };

  /** Header scope. Defaults to col. */
  scope?: 'col' | 'row';
  /** Current sort direction. Defaults to none. */
  sort?: 'none' | 'asc' | 'desc';
  /** Called when the sort button is pressed. Makes the header sortable. */
  onSort?: () => void;
  children: ReactNode;
}

export function TableHeaderCell({ className, slotProps, scope = 'col', sort = 'none', onSort, children }: TableHeaderCellProps) {
  if (sort === 'none' && !onSort) {
    return (
      <th scope={scope} className="cieo cieo-table-header-cell" {...customizePart(slotProps?.root, "cieo cieo-table-header-cell", undefined, className)}>
        {children}
      </th>
    );
  }
  return (
    <th
      scope={scope}
      aria-sort={sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : 'none'}
      data-sort={sort}
      className="cieo cieo-table-header-cell" {...customizePart(slotProps?.root, "cieo cieo-table-header-cell", undefined, className)}
    >
      <button
        type="button"
        onClick={onSort}
        aria-label={typeof children === 'string' ? `Sort by ${children}` : undefined}
        {...customizePart(slotProps?.sortButton)}
      >
        {children}
      </button>
    </th>
  );
}
