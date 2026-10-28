'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* TreeList. Nested list with depth-driven indent. Nest by placing a TreeList inside an <li>; host owns tree data and expansion. */
import type { ReactNode } from 'react';

export interface TreeListProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Nesting depth 0-6; drives indent via data-depth selectors. Defaults to 0. */
  depth?: number;
  /** List items; nest deeper TreeLists inside <li> elements. Required. */
  children: ReactNode;
}

export function TreeList({ className, slotProps, depth = 0, children }: TreeListProps) {
  return (
    <ul data-depth={depth} className="cieo cieo-tree-list" {...customizePart(slotProps?.root, "cieo cieo-tree-list", undefined, className)}>
      {children}
    </ul>
  );
}
