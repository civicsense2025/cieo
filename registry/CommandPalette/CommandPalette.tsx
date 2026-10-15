// src/primitives/CommandPalette/CommandPalette.tsx
'use client';
/* CommandPalette. Controlled command-menu shell. Host filters items from the query; this owns dialog structure + semantics only. */
import type { ReactNode } from 'react';

export interface CommandPaletteProps {
  /** Accessible name for the palette (e.g. "Site commands"). Required. */
  label: string;
  /** Current filter text, owned by the host. Optional. */
  query?: string;
  /** Host filter hook, wired to CommandPaletteInput onChange. Optional. */
  onQueryChange?: (query: string) => void;
  children: ReactNode;
}

export function CommandPalette({ label, query, children }: CommandPaletteProps) {
  return (
    <div role="dialog" aria-label={label} data-query={query} className="cieo cieo-p-command-palette">
      {children}
    </div>
  );
}
