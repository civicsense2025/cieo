// src/primitives/QuotedText/QuotedText.tsx
'use client';
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* QuotedText. Exact words with a hanging quotation mark; mark changed words with <mark>. */
export interface QuotedTextProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Shown above the passage, such as "Endangered Species Act §1302". */
  reference?: string;
  /** Source URL for the quotation. */
  cite?: string;
  children: ReactNode;
}
export function QuotedText({ className, slotProps, reference, cite, children }: QuotedTextProps) {
  return (
    <figure {...customizePart(slotProps?.root, "cieo cieo-p-quoted-text", undefined, className)}>
      {reference ? <figcaption className="cieo-p-quoted-text__ref">{reference}</figcaption> : null}
      <blockquote cite={cite}>{children}</blockquote>
    </figure>
  );
}
