// src/primitives/DropdownMenuSubMenu/DropdownMenuSubMenu.tsx
'use client';
/* DropdownMenuSubMenu. Nested flyout inside a menu. CSS hover/focus-within reveals the panel; no JavaScript motion. */
import type { ReactNode } from 'react';

export interface DropdownMenuSubMenuProps {
  /** Accessible name for the nested menu (e.g. "Export as"). Required. */
  label: string;
  children: ReactNode;
}

export function DropdownMenuSubMenu({ label, children }: DropdownMenuSubMenuProps) {
  return (
    <div className="cieo cieo-dropdown-menu-submenu">
      <button type="button" aria-label={label} className="cieo-dropdown-menu-submenu-trigger">
        {label}
      </button>
      <div role="menu" aria-label={label} className="cieo-dropdown-menu-submenu-panel">
        {children}
      </div>
    </div>
  );
}
