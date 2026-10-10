// src/primitives/DropdownMenuItem/DropdownMenuItem.tsx
'use client';
/* DropdownMenuItem. Single menu action. Label or children supply the text; disabled removes it from selection. */
import type { ReactNode } from 'react';

export interface DropdownMenuItemProps {
  /** Accessible name when children carry no readable text. */
  label?: string;
  /** Removes the item from selection. Defaults to false. */
  disabled?: boolean;
  /** Called when the host should run the action (and usually close the menu). */
  onSelect?: () => void;
  children?: ReactNode;
}

export function DropdownMenuItem({ label, disabled = false, onSelect, children }: DropdownMenuItemProps) {
  return (
    <button type="button" role="menuitem" aria-label={label} disabled={disabled} onClick={() => onSelect?.()} className="cieo cieo-dropdown-menu-item">
      {children ?? label}
    </button>
  );
}
