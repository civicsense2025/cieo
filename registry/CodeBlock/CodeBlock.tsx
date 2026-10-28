// src/primitives/CodeBlock/CodeBlock.tsx
'use client';
/* CodeBlock. Block-level preformatted snippet with an optional language tag. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export interface CodeBlockProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; code?: PrimitivePartProps };

  /** Language tag for readers (e.g. "tsx"). Display only; no highlighting. */
  language?: string;
  /** The snippet text. */
  children: ReactNode;
}

export function CodeBlock({ className, slotProps, language, children }: CodeBlockProps) {
  return (
    <pre {...(language ? { 'data-language': language } : {})} className="cieo cieo-p-code-block" {...customizePart(slotProps?.root, "cieo cieo-p-code-block", undefined, className)}>
      <code {...customizePart(slotProps?.code)}>{children}</code>
    </pre>
  );
}
