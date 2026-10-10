// src/primitives/CodeBlock/CodeBlock.tsx
'use client';
/* CodeBlock. Block-level preformatted snippet with an optional language tag. */
import type { ReactNode } from 'react';
export interface CodeBlockProps {
  /** Language tag for readers (e.g. "tsx"). Display only; no highlighting. */
  language?: string;
  /** The snippet text. */
  children: ReactNode;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  return (
    <pre {...(language ? { 'data-language': language } : {})} className="cieo cieo-p-code-block">
      <code>{children}</code>
    </pre>
  );
}
