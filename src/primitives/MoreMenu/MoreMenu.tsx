// src/primitives/MoreMenu/MoreMenu.tsx
'use client';
/* MoreMenu. IconButton-triggered DropdownMenu. Host menu content as children; the trigger stays a labeled IconButton. */
import type { ReactNode } from 'react';
import { DropdownMenu, type DropdownMenuProps } from '../DropdownMenu/DropdownMenu.js';
import { IconButton } from '../IconButton/IconButton.js';

export interface MoreMenuProps {
  className?: string;
  slotProps?: DropdownMenuProps['slotProps'];
  /** Accessible name for the menu and its trigger. Defaults to 'More actions'. */
  label?: string;
  children: ReactNode;
}

export function MoreMenu({ label = 'More actions', children, className, slotProps }: MoreMenuProps) {
  return (
    <DropdownMenu className={className} slotProps={slotProps} label={label} trigger={<IconButton label={label}>⋯</IconButton>}>
      {children}
    </DropdownMenu>
  );
}
