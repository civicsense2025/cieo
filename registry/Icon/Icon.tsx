// src/primitives/Icon/Icon.tsx
'use client';
/* Icon. Decorative glyph slot; labelled only when it carries meaning alone. */
import type { ReactNode } from 'react';
export interface IconProps {
  /** Accessible name. Omit for decorative icons next to visible text. */
  label?: string;
  /** Glyph size. Defaults to md. */
  size?: 'sm' | 'md';
  /** The single glyph node (svg or character). */
  children: ReactNode;
}

export function Icon({ label, size = 'md', children }: IconProps) {
  if (label) {
    return (
      <span role="img" aria-label={label} data-size={size} className="cieo cieo-p-icon">
        {children}
      </span>
    );
  }
  return (
    <span aria-hidden="true" data-size={size} className="cieo cieo-p-icon">
      {children}
    </span>
  );
}
