// src/primitives/Thumbnail/Thumbnail.tsx
'use client';
/* Thumbnail. Fixed-ratio image preview with a required description. */
export interface ThumbnailProps {
  /** Approved image URL. Required. */
  src: string;
  /** Image description for readers who cannot see it. Required. */
  alt: string;
  /** Preview size. Defaults to md. */
  size?: 'sm' | 'md' | 'lg';
}

export function Thumbnail({ src, alt, size = 'md' }: ThumbnailProps) {
  return <img src={src} alt={alt} data-size={size} loading="lazy" className="cieo cieo-p-thumbnail" />;
}
