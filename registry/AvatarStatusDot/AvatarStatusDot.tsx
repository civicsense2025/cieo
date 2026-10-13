// src/primitives/AvatarStatusDot/AvatarStatusDot.tsx
'use client';
/* AvatarStatusDot. Wraps one face and pins a presence dot to its corner. Dot is decorative. */
import type { ReactNode } from 'react';
export type AvatarStatus = 'default' | 'success' | 'warning' | 'danger' | 'info';
export interface AvatarStatusDotProps {
  /** Presence state shown by the dot. Defaults to default. */
  status?: AvatarStatus;
  /** The single face this decorates (Avatar or approved image). */
  children: ReactNode;
}

export function AvatarStatusDot({ status = 'default', children }: AvatarStatusDotProps) {
  return (
    <span className="cieo cieo-p-avatar-status-dot-wrap">
      {children}
      <span aria-hidden="true" data-status={status} className="cieo-p-avatar-status-dot" />
    </span>
  );
}
