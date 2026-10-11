'use client';
/* IconButton. Square icon-only button. Host supplies the icon node; label is always required. */
import type { ReactNode } from 'react';
export interface IconButtonProps { label: string; size?: 'sm' | 'md'; children: ReactNode; }
export function IconButton({ label, size = 'md', children }: IconButtonProps) {
  return (<button type="button" aria-label={label} data-size={size} className="cieo cieo-icon-button">{children}</button>);
}
