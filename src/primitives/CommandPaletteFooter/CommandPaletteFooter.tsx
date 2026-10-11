// src/primitives/CommandPaletteFooter/CommandPaletteFooter.tsx
'use client';
/* CommandPaletteFooter. Hint bar pinned to the palette bottom (keyboard hints, result counts). */
import type { ReactNode } from 'react';

export interface CommandPaletteFooterProps {
  children: ReactNode;
}

export function CommandPaletteFooter({ children }: CommandPaletteFooterProps) {
  return <div className="cieo cieo-p-command-palette-footer">{children}</div>;
}
