// src/primitives/OverflowList/OverflowList.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* OverflowList. Generic +N overflow for nodes (AvatarGroup pattern). Renders the first max children plus a count; expansion is host-owned. */
import { Children, type ReactNode } from 'react';

export interface OverflowListProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; more?: PrimitivePartProps };

  /** Visible child budget. Defaults to 4. */
  max?: number;
  children: ReactNode;
}

export function OverflowList({ className, slotProps, max = 4, children }: OverflowListProps) {
  const all = Children.toArray(children);
  const shown = all.slice(0, max);
  const rest = all.length - shown.length;
  return (
    <span className="cieo cieo-p-overflow-list" {...customizePart(slotProps?.root, "cieo cieo-p-overflow-list", undefined, className)}>
      {shown}
      {rest > 0 ? <span className="cieo-p-overflow-list-more" aria-label={`${rest} more`} {...customizePart(slotProps?.more, "cieo-p-overflow-list-more")}>+{rest}</span> : null}
    </span>
  );
}
