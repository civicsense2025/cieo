// src/primitives/OverflowList/OverflowList.tsx
'use client';
/* OverflowList. Generic +N overflow for nodes (AvatarGroup pattern). Renders the first max children plus a count; expansion is host-owned. */
import { Children, type ReactNode } from 'react';

export interface OverflowListProps {
  /** Visible child budget. Defaults to 4. */
  max?: number;
  children: ReactNode;
}

export function OverflowList({ max = 4, children }: OverflowListProps) {
  const all = Children.toArray(children);
  const shown = all.slice(0, max);
  const rest = all.length - shown.length;
  return (
    <span className="cieo cieo-p-overflow-list">
      {shown}
      {rest > 0 ? <span className="cieo-p-overflow-list-more">+{rest}</span> : null}
    </span>
  );
}
