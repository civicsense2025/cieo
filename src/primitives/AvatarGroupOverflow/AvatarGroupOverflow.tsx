// src/primitives/AvatarGroupOverflow/AvatarGroupOverflow.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* AvatarGroupOverflow. The +N disc that closes a face stack. Count only; the row owns names. */
export interface AvatarGroupOverflowProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Hidden face count shown as +N. Required. */
  count: number;
  /** Disc size, matches the stack faces. Defaults to md. */
  size?: 'sm' | 'md';
}

export function AvatarGroupOverflow({ className, slotProps, count, size = 'md' }: AvatarGroupOverflowProps) {
  return (
    <span aria-hidden="true" data-size={size} className="cieo cieo-p-avatar-group-overflow" {...customizePart(slotProps?.root, "cieo cieo-p-avatar-group-overflow", undefined, className)}>
      +{count}
    </span>
  );
}
