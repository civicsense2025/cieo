// src/primitives/Avatar/Avatar.tsx
'use client';
/* Avatar. Single face: photo when approved, initials otherwise. Own look via cieo-p-avatar-one. */
export interface AvatarProps {
  /** Full name; becomes the accessible label. Required. */
  name: string;
  /** 1–3 characters shown when there is no photo. Required. */
  initials: string;
  /** Approved photo URL only. Omit when none exists; never guess a photo. */
  src?: string;
  /** Face size. Defaults to md. */
  size?: 'sm' | 'md';
}

export function Avatar({ name, initials, src, size = 'md' }: AvatarProps) {
  return (
    <span role="img" aria-label={name} data-size={size} className="cieo cieo-p-avatar-one">
      {src ? <img src={src} alt="" loading="lazy" /> : <span className="cieo-p-avatar-one-initials">{initials}</span>}
    </span>
  );
}
