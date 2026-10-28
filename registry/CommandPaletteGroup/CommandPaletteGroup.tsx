// src/primitives/CommandPaletteGroup/CommandPaletteGroup.tsx
'use client';
/* CommandPaletteGroup. Labeled cluster of commands inside the list. Host owns contents; this owns group semantics. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface CommandPaletteGroupProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; label?: PrimitivePartProps };

  /** Group heading (e.g. "Pages"). Optional. */
  label?: string;
  children: ReactNode;
}

export function CommandPaletteGroup({ className, slotProps, label, children }: CommandPaletteGroupProps) {
  return (
    <div role="group" aria-label={label} className="cieo cieo-p-command-palette-group" {...customizePart(slotProps?.root, "cieo cieo-p-command-palette-group", undefined, className)}>
      {label ? <p className="cieo-p-command-palette-group-label" {...customizePart(slotProps?.label, "cieo-p-command-palette-group-label", undefined)}>{label}</p> : null}
      {children}
    </div>
  );
}
