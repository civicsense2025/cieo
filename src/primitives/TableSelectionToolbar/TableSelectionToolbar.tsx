'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* TableSelectionToolbar. Selected-count bar with host-supplied bulk actions. Host owns selection state; this renders the count and actions only. */
import type { ReactNode } from 'react';

export interface TableSelectionToolbarProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Number of selected rows. Required. */
  selectedCount: number;
  /** Bulk action buttons. Required. */
  children: ReactNode;
}

export function TableSelectionToolbar({ className, slotProps, selectedCount, children }: TableSelectionToolbarProps) {
  return (
    <div role="toolbar" aria-label={`${selectedCount} selected`} className="cieo cieo-table-selection-toolbar" {...customizePart(slotProps?.root, "cieo cieo-table-selection-toolbar", undefined, className)}>
      <span>{selectedCount} selected</span>
      {children}
    </div>
  );
}
