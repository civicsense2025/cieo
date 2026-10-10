// src/primitives/AvatarGroupOverflow/AvatarGroupOverflow.tsx
'use client';
/* AvatarGroupOverflow. The +N disc that closes a face stack. Count only; the row owns names. */
export interface AvatarGroupOverflowProps {
  /** Hidden face count shown as +N. Required. */
  count: number;
  /** Disc size, matches the stack faces. Defaults to md. */
  size?: 'sm' | 'md';
}

export function AvatarGroupOverflow({ count, size = 'md' }: AvatarGroupOverflowProps) {
  return (
    <span aria-hidden="true" data-size={size} className="cieo cieo-p-avatar-group-overflow">
      +{count}
    </span>
  );
}
