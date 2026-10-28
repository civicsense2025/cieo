'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* MetadataList. <dl> grid of term/description pairs. Host supplies MetadataListItem children; this owns list layout only. */
import type { ReactNode } from 'react';

export interface MetadataListProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Metadata items. Required. */
  children: ReactNode;
}

export function MetadataList({ className, slotProps, children }: MetadataListProps) {
  return (
    <dl className="cieo cieo-metadata-list" {...customizePart(slotProps?.root, "cieo cieo-metadata-list", undefined, className)}>
      {children}
    </dl>
  );
}
