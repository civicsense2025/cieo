// src/primitives/Citation/Citation.tsx
'use client';
/* Citation. Source title, linked when a URL exists. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export interface CitationProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; content?: PrimitivePartProps };

  /** Source URL. Omit for offline or print-only sources. */
  href?: string;
  /** The source title. */
  children: ReactNode;
}

export function Citation({ className, slotProps, href, children }: CitationProps) {
  if (href) {
    return (
      <a href={href} className="cieo cieo-p-citation-link" {...customizePart(slotProps?.root, "cieo cieo-p-citation-link", undefined, className)}>
        <cite className="cieo cieo-p-citation" {...customizePart(slotProps?.content, "cieo cieo-p-citation", undefined)}>{children}</cite>
      </a>
    );
  }
  return <cite className="cieo cieo-p-citation" {...customizePart(slotProps?.root, "cieo cieo-p-citation", undefined, className)}>{children}</cite>;
}
