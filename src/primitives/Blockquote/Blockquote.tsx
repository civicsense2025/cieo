// src/primitives/Blockquote/Blockquote.tsx
'use client';
/* Blockquote. Quoted passage with an optional source credit. */
import type { ReactNode } from 'react';
export interface BlockquoteProps {
  /** Source credit shown under the quote. Omit when unknown. */
  cite?: string;
  /** The quoted passage. */
  children: ReactNode;
}

export function Blockquote({ cite, children }: BlockquoteProps) {
  return (
    <blockquote className="cieo cieo-p-blockquote">
      {children}
      {cite ? (
        <footer>
          <cite>{cite}</cite>
        </footer>
      ) : null}
    </blockquote>
  );
}
