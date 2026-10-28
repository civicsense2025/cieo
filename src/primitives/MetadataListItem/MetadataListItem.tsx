'use client';
/* MetadataListItem. One dt+dd pair inside a MetadataList. Host supplies the term and description; this owns pair semantics only. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface MetadataListItemProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; term?: PrimitivePartProps; description?: PrimitivePartProps };

  /** Term name (the dt). Required. */
  term: string;
  /** Description content (the dd). Required. */
  children: ReactNode;
}

export function MetadataListItem({ className, slotProps, term, children }: MetadataListItemProps) {
  return (
    <div className="cieo cieo-metadata-list-item" {...customizePart(slotProps?.root, "cieo cieo-metadata-list-item", undefined, className)}>
      <dt {...customizePart(slotProps?.term)}>{term}</dt>
      <dd {...customizePart(slotProps?.description)}>{children}</dd>
    </div>
  );
}
