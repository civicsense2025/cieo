'use client';
/* TableSelectionToolbar. Selected-count bar with host-supplied bulk actions. Host owns selection state; this renders the count and actions only. */
import type { ReactNode } from 'react';

export interface TableSelectionToolbarProps {
  /** Number of selected rows. Required. */
  selectedCount: number;
  /** Bulk action buttons. Required. */
  children: ReactNode;
}

export function TableSelectionToolbar({ selectedCount, children }: TableSelectionToolbarProps) {
  return (
    <div role="toolbar" aria-label={`${selectedCount} selected`} className="cieo cieo-table-selection-toolbar">
      <span>{selectedCount} selected</span>
      {children}
    </div>
  );
}
