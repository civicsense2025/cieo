// src/primitives/CommandPaletteList/CommandPaletteList.tsx
'use client';
/* CommandPaletteList. Option container inside CommandPalette. Host filters children from the query. */
import type { ReactNode } from 'react';

export interface CommandPaletteListProps {
  /** Accessible name for the option list. Optional. */
  label?: string;
  children: ReactNode;
}

export function CommandPaletteList({ label, children }: CommandPaletteListProps) {
  return (
    <div role="listbox" aria-label={label} className="cieo cieo-p-command-palette-list">
      {children}
    </div>
  );
}
