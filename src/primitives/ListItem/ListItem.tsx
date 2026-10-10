'use client';
/* ListItem. One row: consistent padding with a divider. Host owns row content and actions. */
import type { ReactNode } from 'react';
export interface ListItemProps { children: ReactNode; }
export function ListItem({ children }: ListItemProps) {
  return (<li className="cieo-p-list-item">{children}</li>);
}
