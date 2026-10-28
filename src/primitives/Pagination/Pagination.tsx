// src/primitives/Pagination/Pagination.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Pagination. Windowed page nav (±2 around the current page); host owns page state. */
import { Digits } from '../../react/index.js';

export interface PaginationProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Current page (1-based). Required. */
  page: number;
  /** Total page count. Required. */
  pageCount: number;
  /** Page change handler. */
  onPageChange?: (page: number) => void;
  /** Accessible name. Defaults to Pagination. */
  label?: string;
  /** False renders the current numeral instantly. Defaults to true (numeral rolls on change). */
  motion?: boolean;
}

export function Pagination({ className, slotProps, page, pageCount, onPageChange, label = 'Pagination', motion }: PaginationProps) {
  const start = Math.max(1, page - 2);
  const end = Math.min(pageCount, page + 2);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return (
    <nav aria-label={label} className="cieo cieo-pagination" {...customizePart(slotProps?.root, "cieo cieo-pagination", undefined, className)}>
      <button type="button" disabled={page <= 1} aria-label="Previous page" onClick={() => onPageChange?.(page - 1)}>
        Previous
      </button>
      {pages.map((p) =>
        p === page ? (
          <button key="current-page" type="button" aria-current="page" onClick={() => onPageChange?.(p)}>
            {motion === false ? p : <Digits value={page} kind="feedback" />}
          </button>
        ) : (
          <button key={p} type="button" onClick={() => onPageChange?.(p)}>
            {p}
          </button>
        ),
      )}
      <button type="button" disabled={page >= pageCount} aria-label="Next page" onClick={() => onPageChange?.(page + 1)}>
        Next
      </button>
    </nav>
  );
}
