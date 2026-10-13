'use client';
/* List. Plain row collection with consistent dividers. Ordered when sequence matters. */
import type { ReactNode } from 'react';
export interface ListProps { ordered?: boolean; label?: string; children: ReactNode; }
export function List({ ordered = false, label, children }: ListProps) {
  const Tag = ordered ? 'ol' : 'ul';
  return (<Tag aria-label={label} className="cieo cieo-p-list">{children}</Tag>);
}
