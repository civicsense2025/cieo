'use client';
/* MetadataListItem. One dt+dd pair inside a MetadataList. Host supplies the term and description; this owns pair semantics only. */
import type { ReactNode } from 'react';

export interface MetadataListItemProps {
  /** Term name (the dt). Required. */
  term: string;
  /** Description content (the dd). Required. */
  children: ReactNode;
}

export function MetadataListItem({ term, children }: MetadataListItemProps) {
  return (
    <div className="cieo cieo-metadata-list-item">
      <dt>{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}
