// src/primitives/Code/Code.tsx
'use client';
/* Code. Inline code span for names, keys, and short snippets inside prose. */
import type { ReactNode } from 'react';
export interface CodeProps {
  /** Inline code content. */
  children: ReactNode;
}

export function Code({ children }: CodeProps) {
  return <code className="cieo cieo-p-code">{children}</code>;
}
