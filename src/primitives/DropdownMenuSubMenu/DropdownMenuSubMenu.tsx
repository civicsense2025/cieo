// src/primitives/DropdownMenuSubMenu/DropdownMenuSubMenu.tsx
'use client';
/* DropdownMenuSubMenu. Nested flyout inside a menu. CSS hover/focus-within reveals the panel; no JavaScript motion. */
import type { ReactNode } from 'react';
import { motionAttrs, type MotionProps } from '../motion.js';

export interface DropdownMenuSubMenuProps extends MotionProps {
  /** Accessible name for the nested menu (e.g. "Export as"). Required. */
  label: string;
  children: ReactNode;
}

export function DropdownMenuSubMenu({ label, children, motion, entering = 'fade', exiting = 'fade' }: DropdownMenuSubMenuProps) {
  return (
    <div className="cieo cieo-dropdown-menu-submenu" {...motionAttrs({ motion, entering, exiting })}>
      <button type="button" aria-label={label} className="cieo-dropdown-menu-submenu-trigger">
        {label}
      </button>
      <div role="menu" aria-label={label} className="cieo-dropdown-menu-submenu-panel">
        {children}
      </div>
    </div>
  );
}
