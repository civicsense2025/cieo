// src/primitives/Icon/Icon.tsx
'use client';
/* Icon. Decorative glyph slot; labelled only when it carries meaning alone. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export interface IconProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name. Omit for decorative icons next to visible text. */
  label?: string;
  /** Glyph size. Defaults to md. */
  size?: 'sm' | 'md';
  /** The single glyph node (svg or character). */
  children: ReactNode;
}

export function Icon({ className, slotProps, label, size = 'md', children }: IconProps) {
  if (label) {
    return (
      <span role="img" aria-label={label} data-size={size} className="cieo cieo-p-icon" {...customizePart(slotProps?.root, "cieo cieo-p-icon", undefined, className)}>
        {children}
      </span>
    );
  }
  return (
    <span aria-hidden="true" data-size={size} className="cieo cieo-p-icon" {...customizePart(slotProps?.root, "cieo cieo-p-icon", undefined, className)}>
      {children}
    </span>
  );
}
