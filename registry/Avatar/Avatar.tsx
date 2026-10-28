// src/primitives/Avatar/Avatar.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Avatar. Single face: photo when approved, initials otherwise. Own look via cieo-p-avatar-one. */
export interface AvatarProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; initials?: PrimitivePartProps; image?: PrimitivePartProps };

  /** Full name; becomes the accessible label. Required. */
  name: string;
  /** 1–3 characters shown when there is no photo. Required. */
  initials: string;
  /** Approved photo URL only. Omit when none exists; never guess a photo. */
  src?: string;
  /** Face size. Defaults to md. */
  size?: 'sm' | 'md';
}

export function Avatar({ className, slotProps, name, initials, src, size = 'md' }: AvatarProps) {
  return (
    <span role="img" aria-label={name} data-size={size} className="cieo cieo-p-avatar-one" {...customizePart(slotProps?.root, "cieo cieo-p-avatar-one", undefined, className)}>
      {src ? <img src={src} alt="" loading="lazy" {...customizePart(slotProps?.image)} /> : <span className="cieo-p-avatar-one-initials" {...customizePart(slotProps?.initials, "cieo-p-avatar-one-initials", undefined)}>{initials}</span>}
    </span>
  );
}
