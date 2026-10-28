// src/primitives/AvatarStatusDot/AvatarStatusDot.tsx
'use client';
/* AvatarStatusDot. Wraps one face and pins a presence dot to its corner. Dot is decorative. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export type AvatarStatus = 'default' | 'success' | 'warning' | 'danger' | 'info';
export interface AvatarStatusDotProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; dot?: PrimitivePartProps };

  /** Presence state shown by the dot. Defaults to default. */
  status?: AvatarStatus;
  /** The single face this decorates (Avatar or approved image). */
  children: ReactNode;
}

export function AvatarStatusDot({ className, slotProps, status = 'default', children }: AvatarStatusDotProps) {
  return (
    <span className="cieo cieo-p-avatar-status-dot-wrap" {...customizePart(slotProps?.root, "cieo cieo-p-avatar-status-dot-wrap", undefined, className)}>
      {children}
      <span aria-hidden="true" data-status={status} className="cieo-p-avatar-status-dot" {...customizePart(slotProps?.dot, "cieo-p-avatar-status-dot", undefined)} />
    </span>
  );
}
