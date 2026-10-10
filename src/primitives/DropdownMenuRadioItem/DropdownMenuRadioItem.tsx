// src/primitives/DropdownMenuRadioItem/DropdownMenuRadioItem.tsx
'use client';
/* DropdownMenuRadioItem. One pick inside DropdownMenuRadioGroup. Checked when the group value equals its own value. */
import { useContext } from 'react';
import { DropdownMenuRadioGroupContext } from '../DropdownMenuRadioGroup/DropdownMenuRadioGroup.js';

export interface DropdownMenuRadioItemProps {
  /** Accessible name for the option (e.g. "Newest first"). Required. */
  label: string;
  /** Option key matched against the group value. Required. */
  value: string;
}

export function DropdownMenuRadioItem({ label, value }: DropdownMenuRadioItemProps) {
  const group = useContext(DropdownMenuRadioGroupContext);
  const checked = group?.value === value;
  return (
    <button type="button" role="menuitemradio" aria-checked={checked} aria-label={label} data-checked={checked} onClick={() => group?.onSelect?.(value)} className="cieo cieo-dropdown-menu-radio-item">
      {label}
    </button>
  );
}
