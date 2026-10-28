// src/primitives/CommandPaletteItem/CommandPaletteItem.tsx
'use client';
/* CommandPaletteItem. One pickable command. Host owns filtering and highlight; this owns option semantics. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface CommandPaletteItemProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Stable command value passed back to onSelect. Required. */
  value: string;
  /** Whether this item is the active match. Defaults to false. */
  selected?: boolean;
  /** Host pick hook. Optional. */
  onSelect?: (value: string) => void;
  children: ReactNode;
}

export function CommandPaletteItem({ className, slotProps, value, selected = false, onSelect, children }: CommandPaletteItemProps) {
  return (
    <div
      role="option"
      aria-selected={selected}
      data-value={value}
      tabIndex={-1}
      onClick={() => onSelect?.(value)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(value); } }}
      className="cieo cieo-p-command-palette-item" {...customizePart(slotProps?.root, "cieo cieo-p-command-palette-item", undefined, className)}
    >
      {children}
    </div>
  );
}
