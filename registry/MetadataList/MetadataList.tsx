'use client';
/* MetadataList. <dl> grid of term/description pairs. Host supplies MetadataListItem children; this owns list layout only. */
import type { ReactNode } from 'react';

export interface MetadataListProps {
  /** Metadata items. Required. */
  children: ReactNode;
}

export function MetadataList({ children }: MetadataListProps) {
  return (
    <dl className="cieo cieo-metadata-list">
      {children}
    </dl>
  );
}
