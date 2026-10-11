// src/primitives/Citation/Citation.tsx
'use client';
/* Citation. Source title, linked when a URL exists. */
import type { ReactNode } from 'react';
export interface CitationProps {
  /** Source URL. Omit for offline or print-only sources. */
  href?: string;
  /** The source title. */
  children: ReactNode;
}

export function Citation({ href, children }: CitationProps) {
  if (href) {
    return (
      <a href={href} className="cieo cieo-p-citation-link">
        <cite className="cieo cieo-p-citation">{children}</cite>
      </a>
    );
  }
  return <cite className="cieo cieo-p-citation">{children}</cite>;
}
