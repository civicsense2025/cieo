// src/primitives/DropdownMenuDivider/DropdownMenuDivider.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export interface DropdownMenuDividerProps { className?: string; slotProps?: { root?: PrimitivePartProps }; }
/* DropdownMenuDivider. Visual split between menu clusters. Decorative only; never focusable. */
export function DropdownMenuDivider({ className, slotProps }: DropdownMenuDividerProps = {}) {
  return (
    <div role="separator" className="cieo cieo-dropdown-menu-divider" {...customizePart(slotProps?.root, 'cieo cieo-dropdown-menu-divider', undefined, className)} />
  );
}
