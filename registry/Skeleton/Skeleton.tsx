// src/primitives/Skeleton/Skeleton.tsx
'use client';
/* Skeleton. aria-hidden pulse lines plus a screen-reader label. Static under reduced motion. */
export interface SkeletonProps {
  /** Line count, 1–12. Defaults to 3. */
  lines?: number;
  /** Screen-reader label. Defaults to Loading. */
  label?: string;
  /** False renders the static bar instantly. Defaults to true. */
  motion?: boolean;
}

export function Skeleton({ lines = 3, label = 'Loading', motion }: SkeletonProps) {
  return (
    <span className="cieo cieo-p-skeleton" data-motion={motion === false ? 'off' : undefined}>
      <span aria-hidden="true" className="cieo-p-skeleton-lines">
        {Array(lines)
          .fill(null)
          .map((_, i) => (
            <span key={i} className="cieo-p-skeleton-line" />
          ))}
      </span>
      <span className="cieo-p-skeleton-label">{label}</span>
    </span>
  );
}
