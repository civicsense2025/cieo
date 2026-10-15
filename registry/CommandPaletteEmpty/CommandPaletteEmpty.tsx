// src/primitives/CommandPaletteEmpty/CommandPaletteEmpty.tsx
'use client';
/* CommandPaletteEmpty. Quiet empty text when the host filter matches nothing. */
import type { ReactNode } from 'react';

export interface CommandPaletteEmptyProps {
  /** Override text. Defaults to "No results". */
  children?: ReactNode;
}

export function CommandPaletteEmpty({ children }: CommandPaletteEmptyProps) {
  return <p className="cieo cieo-p-command-palette-empty">{children ?? 'No results'}</p>;
}
