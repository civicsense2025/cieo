// src/primitives/Skeleton/Skeleton.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Skeleton. aria-hidden pulse lines plus a screen-reader label. Static under reduced motion. */
export interface SkeletonProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; lines?: PrimitivePartProps; line?: PrimitivePartProps; label?: PrimitivePartProps };

  /** Line count, 1–12. Defaults to 3. */
  lines?: number;
  /** Screen-reader label. Defaults to Loading. */
  label?: string;
  /** False renders the static bar instantly. Defaults to true. */
  motion?: boolean;
}

export function Skeleton({ className, slotProps, lines = 3, label = 'Loading', motion }: SkeletonProps) {
  return (
    <span className="cieo cieo-p-skeleton" data-motion={motion === false ? 'off' : undefined} {...customizePart(slotProps?.root, "cieo cieo-p-skeleton", undefined, className)}>
      <span aria-hidden="true" className="cieo-p-skeleton-lines" {...customizePart(slotProps?.lines, "cieo-p-skeleton-lines", undefined)}>
        {Array(lines)
          .fill(null)
          .map((_, i) => (
            <span key={i} className="cieo-p-skeleton-line" {...customizePart(slotProps?.line, "cieo-p-skeleton-line", undefined)} />
          ))}
      </span>
      <span className="cieo-p-skeleton-label" {...customizePart(slotProps?.label, "cieo-p-skeleton-label", undefined)}>{label}</span>
    </span>
  );
}
