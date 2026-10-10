// src/primitives/CommandPaletteGroup/CommandPaletteGroup.tsx
'use client';
/* CommandPaletteGroup. Labeled cluster of commands inside the list. Host owns contents; this owns group semantics. */
import type { ReactNode } from 'react';

export interface CommandPaletteGroupProps {
  /** Group heading (e.g. "Pages"). Optional. */
  label?: string;
  children: ReactNode;
}

export function CommandPaletteGroup({ label, children }: CommandPaletteGroupProps) {
  return (
    <div role="group" aria-label={label} className="cieo cieo-p-command-palette-group">
      {label ? <p className="cieo-p-command-palette-group-label">{label}</p> : null}
      {children}
    </div>
  );
}
