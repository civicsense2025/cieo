// src/primitives/Portrait/Portrait.tsx
'use client';
import type { CSSProperties } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Portrait. Decorative face; the name beside it speaks. No photo shows a quiet fill, never initials. */
export interface PortraitProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  src?: string;
  size?: 'small' | 'regular' | 'large';
  /** Ring color, such as a party color. */
  ring?: string;
  /** Grayscale by blend, so the ring keeps its color. */
  grayscale?: boolean;
}
/** A quoted CSS url() value. Quotes, backslashes, parentheses and control characters are percent-encoded; JSON escaping is not CSS escaping. */
export function cssUrl(src: string): string {
  return `url("${src.replace(/[\u0000-\u001f\u007f"'\\()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`)}")`;
}
export function Portrait({ className, slotProps, src, size = 'regular', ring, grayscale = false }: PortraitProps) {
  const ownedStyle = ring || src
    ? ({ ...(ring ? { '--cieo-portrait-ring': ring } : {}), ...(src ? { backgroundImage: cssUrl(src) } : {}) } as CSSProperties)
    : undefined;
  return (
    <span className="cieo cieo-p-portrait" aria-hidden="true" data-size={size} data-grayscale={grayscale ? '' : undefined} style={ownedStyle} {...customizePart(slotProps?.root, "cieo cieo-p-portrait", ownedStyle, className)} />
  );
}
