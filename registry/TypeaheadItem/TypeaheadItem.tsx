// src/primitives/TypeaheadItem/TypeaheadItem.tsx
'use client';
/* TypeaheadItem. One match row inside Typeahead. Host owns filtering and commit. */
import type { ReactNode } from 'react';

export interface TypeaheadItemProps {
  /** Stable match value passed back to onSelect. Required. */
  value: string;
  /** Host pick hook. Optional. */
  /** Marks the option as the active choice. Defaults to false. */
  selected?: boolean;
  onSelect?: (value: string) => void;
  children: ReactNode;
}

export function TypeaheadItem({ value, selected = false, onSelect, children }: TypeaheadItemProps) {
  return (
    <div role="option" aria-selected={selected} tabIndex={-1} data-value={value} onClick={() => onSelect?.(value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(value); } }} className="cieo cieo-p-typeahead-item">
      {children}
    </div>
  );
}
