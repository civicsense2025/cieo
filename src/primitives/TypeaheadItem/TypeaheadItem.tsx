// src/primitives/TypeaheadItem/TypeaheadItem.tsx
'use client';
/* TypeaheadItem. One match row inside Typeahead. Host owns filtering and commit. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface TypeaheadItemProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Stable match value passed back to onSelect. Required. */
  value: string;
  /** Host pick hook. Optional. */
  /** Marks the option as the active choice. Defaults to false. */
  selected?: boolean;
  onSelect?: (value: string) => void;
  children: ReactNode;
}

export function TypeaheadItem({ className, slotProps, value, selected = false, onSelect, children }: TypeaheadItemProps) {
  return (
    <div role="option" aria-selected={selected} tabIndex={-1} data-value={value} onClick={() => onSelect?.(value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(value); } }} className="cieo cieo-p-typeahead-item" {...customizePart(slotProps?.root, "cieo cieo-p-typeahead-item", undefined, className)}>
      {children}
    </div>
  );
}
