// src/primitives/Thumbnail/Thumbnail.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Thumbnail. Fixed-ratio image preview with a required description. */
export interface ThumbnailProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Approved image URL. Required. */
  src: string;
  /** Image description for readers who cannot see it. Required. */
  alt: string;
  /** Preview size. Defaults to md. */
  size?: 'sm' | 'md' | 'lg';
}

export function Thumbnail({ className, slotProps, src, alt, size = 'md' }: ThumbnailProps) {
  return <img src={src} alt={alt} data-size={size} loading="lazy" className="cieo cieo-p-thumbnail" {...customizePart(slotProps?.root, "cieo cieo-p-thumbnail", undefined, className)} />;
}
