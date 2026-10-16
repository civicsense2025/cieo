// src/primitives/DropdownMenuItem/DropdownMenuItem.tsx
'use client';
/* DropdownMenuItem. Single menu action. Label or children supply the text; disabled removes it from selection. */
import { useContext, type ReactNode } from 'react';
import { DropdownMenuContext } from '../DropdownMenu/DropdownMenu.js';

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
  const menu = useContext(DropdownMenuContext);
  return (
    <button type="button" role="menuitem" aria-label={label} disabled={disabled} onClick={() => { onSelect?.(); menu?.close(); }} className="cieo cieo-dropdown-menu-item">
      {children ?? label}
    </button>
  );
}
