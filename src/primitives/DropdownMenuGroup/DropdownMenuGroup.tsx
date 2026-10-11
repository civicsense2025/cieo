// src/primitives/DropdownMenuGroup/DropdownMenuGroup.tsx
'use client';
/* DropdownMenuGroup. Labeled section inside a menu. Owns the group name only; items stay host-owned. */
import type { ReactNode } from 'react';

export interface DropdownMenuGroupProps {
  /** Section name announced with the group. Optional; omit for unlabeled clusters. */
  label?: string;
  children: ReactNode;
}

export function DropdownMenuGroup({ label, children }: DropdownMenuGroupProps) {
  return (
    <div role="group" aria-label={label} className="cieo cieo-dropdown-menu-group">
      {label ? <span className="cieo-dropdown-menu-group-label">{label}</span> : null}
      {children}
    </div>
  );
}
