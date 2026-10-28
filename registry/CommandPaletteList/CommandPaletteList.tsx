// src/primitives/CommandPaletteList/CommandPaletteList.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* CommandPaletteList. Option container inside CommandPalette. Host filters children from the query. */
import type { ReactNode } from 'react';

export interface CommandPaletteListProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the option list. Optional. */
  label?: string;
  children: ReactNode;
}

export function CommandPaletteList({ className, slotProps, label, children }: CommandPaletteListProps) {
  return (
    <div role="listbox" aria-label={label} className="cieo cieo-p-command-palette-list" {...customizePart(slotProps?.root, "cieo cieo-p-command-palette-list", undefined, className)}>
      {children}
    </div>
  );
}
