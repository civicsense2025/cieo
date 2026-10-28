// src/primitives/DropdownMenuGroup/DropdownMenuGroup.tsx
'use client';
/* DropdownMenuGroup. Labeled section inside a menu. Owns the group name only; items stay host-owned. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface DropdownMenuGroupProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; label?: PrimitivePartProps };

  /** Section name announced with the group. Optional; omit for unlabeled clusters. */
  label?: string;
  children: ReactNode;
}

export function DropdownMenuGroup({ className, slotProps, label, children }: DropdownMenuGroupProps) {
  return (
    <div role="group" aria-label={label} className="cieo cieo-dropdown-menu-group" {...customizePart(slotProps?.root, "cieo cieo-dropdown-menu-group", undefined, className)}>
      {label ? <span className="cieo-dropdown-menu-group-label" {...customizePart(slotProps?.label, "cieo-dropdown-menu-group-label", undefined)}>{label}</span> : null}
      {children}
    </div>
  );
}
