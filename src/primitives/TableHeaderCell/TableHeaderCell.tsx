'use client';
/* TableHeaderCell. <th> with scope and an optional sort button. Host owns sorting; this renders the header control only. */
import type { ReactNode } from 'react';

export interface TableHeaderCellProps {
  /** Header scope. Defaults to col. */
  scope?: 'col' | 'row';
  /** Sort state; none renders a plain th, asc/desc renders a sort button. Defaults to none. */
  sort?: 'none' | 'asc' | 'desc';
  /** Called when the sort button is pressed. Host updates data order. */
  onSort?: () => void;
  /** Header content. Required. */
  children: ReactNode;
}

export function TableHeaderCell({ scope = 'col', sort = 'none', onSort, children }: TableHeaderCellProps) {
  if (sort === 'none') {
    return (
      <th scope={scope} className="cieo cieo-table-header-cell">
        {children}
      </th>
    );
  }
  return (
    <th
      scope={scope}
      aria-sort={sort === 'asc' ? 'ascending' : 'descending'}
      data-sort={sort}
      className="cieo cieo-table-header-cell"
    >
      <button
        type="button"
        onClick={onSort}
        aria-label={typeof children === 'string' ? `Sort by ${children}` : undefined}
      >
        {children}
      </button>
    </th>
  );
}
