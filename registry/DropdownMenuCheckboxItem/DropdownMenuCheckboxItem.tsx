// src/primitives/DropdownMenuCheckboxItem/DropdownMenuCheckboxItem.tsx
'use client';
/* DropdownMenuCheckboxItem. Menu row that flips one setting on or off. Host owns the checked value and persistence. */
import type { ReactNode } from 'react';

export interface DropdownMenuCheckboxItemProps {
  /** Accessible name for the setting (e.g. "Show line numbers"). Required. */
  label: string;
  /** Checked state. Defaults to false. */
  checked?: boolean;
  /** Called with the next checked state. */
  onCheckedChange?: (checked: boolean) => void;
  children?: ReactNode;
}

export function DropdownMenuCheckboxItem({ label, checked = false, onCheckedChange, children }: DropdownMenuCheckboxItemProps) {
  return (
    <button type="button" role="menuitemcheckbox" aria-checked={checked} aria-label={label} data-checked={checked} onClick={() => onCheckedChange?.(!checked)} className="cieo cieo-dropdown-menu-checkbox-item">
      {children ?? label}
    </button>
  );
}
