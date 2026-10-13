// src/primitives/TypeaheadItem/TypeaheadItem.tsx
'use client';
/* TypeaheadItem. One match row inside Typeahead. Host owns filtering and commit. */
import type { ReactNode } from 'react';

export interface TypeaheadItemProps {
  /** Stable match value passed back to onSelect. Required. */
  value: string;
  /** Host pick hook. Optional. */
  onSelect?: (value: string) => void;
  children: ReactNode;
}

export function TypeaheadItem({ value, onSelect, children }: TypeaheadItemProps) {
  return (
    <div role="option" aria-selected="false" data-value={value} onClick={() => onSelect?.(value)} className="cieo cieo-p-typeahead-item">
      {children}
    </div>
  );
}
