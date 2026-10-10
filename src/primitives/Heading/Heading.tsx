// src/primitives/Heading/Heading.tsx
'use client';
/* Heading. Section titles h1–h6 with an em-based scale. One h1 per page. */
import type { ReactNode } from 'react';
export interface HeadingProps {
  /** Heading level. Defaults to 2. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** The title text. */
  children: ReactNode;
}

export function Heading({ level = 2, children }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag data-level={level} className="cieo cieo-p-heading">
      {children}
    </Tag>
  );
}
