// src/primitives/CommandPaletteEmpty/CommandPaletteEmpty.tsx
'use client';
/* CommandPaletteEmpty. Quiet empty text when the host filter matches nothing. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface CommandPaletteEmptyProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Override text. Defaults to "No results". */
  children?: ReactNode;
}

export function CommandPaletteEmpty({ className, slotProps, children }: CommandPaletteEmptyProps) {
  return <p className="cieo cieo-p-command-palette-empty" {...customizePart(slotProps?.root, "cieo cieo-p-command-palette-empty", undefined, className)}>{children ?? 'No results'}</p>;
}
