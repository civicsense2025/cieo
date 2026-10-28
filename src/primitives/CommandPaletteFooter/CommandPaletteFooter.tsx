// src/primitives/CommandPaletteFooter/CommandPaletteFooter.tsx
'use client';
/* CommandPaletteFooter. Hint bar pinned to the palette bottom (keyboard hints, result counts). */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface CommandPaletteFooterProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  children: ReactNode;
}

export function CommandPaletteFooter({ className, slotProps, children }: CommandPaletteFooterProps) {
  return <div className="cieo cieo-p-command-palette-footer" {...customizePart(slotProps?.root, "cieo cieo-p-command-palette-footer", undefined, className)}>{children}</div>;
}
