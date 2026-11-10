// src/primitives/PersonRow/PersonRow.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import { Portrait } from '../Portrait/Portrait.js';
/* PersonRow. Portrait, a one-line name and a detail. */
export interface PersonRowProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  name: string;
  detail?: string;
  src?: string;
  ring?: string;
  compact?: boolean;
  grayscale?: boolean;
}
export function PersonRow({ className, slotProps, name, detail, src, ring, compact = false, grayscale = false }: PersonRowProps) {
  return (
    <div {...customizePart(slotProps?.root, "cieo cieo-p-person-row", undefined, className)} data-compact={compact ? '' : undefined}>
      <Portrait src={src} ring={ring} grayscale={grayscale} size={compact ? 'small' : 'regular'} />
      <span className="cieo-p-person-row__text"><b>{name}</b>{detail ? <span>{detail}</span> : null}</span>
    </div>
  );
}
