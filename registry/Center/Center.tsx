// src/primitives/Center/Center.tsx
'use client';
/* Center. Centered content column with a max width. Host owns the content; this owns centering only. */
import type { ReactNode } from 'react';

export interface CenterProps {
  /** Max inline width of the column. Defaults to '60rem'. */
  maxWidth?: string;
  children: ReactNode;
}

export function Center({ maxWidth = '60rem', children }: CenterProps) {
  return (
    <div style={{ maxWidth }} className="cieo cieo-center">
      {children}
    </div>
  );
}
