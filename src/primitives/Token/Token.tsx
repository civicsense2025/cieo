// src/primitives/Token/Token.tsx
'use client';
/* Token. Minimal pill for keywords and filters. Own paint; not Badge's. */
import type { ReactNode } from 'react';
export interface TokenProps {
  /** Fill emphasis. Defaults to default. */
  tone?: 'default' | 'accent';
  /** The keyword or filter text. */
  children: ReactNode;
}

export function Token({ tone = 'default', children }: TokenProps) {
  return (
    <span data-tone={tone} className="cieo cieo-p-token">
      {children}
    </span>
  );
}
