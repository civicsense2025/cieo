// src/primitives/Code/Code.tsx
'use client';
/* Code. Inline code span for names, keys, and short snippets inside prose. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export interface CodeProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Inline code content. */
  children: ReactNode;
}

export function Code({ className, slotProps, children }: CodeProps) {
  return <code className="cieo cieo-p-code" {...customizePart(slotProps?.root, "cieo cieo-p-code", undefined, className)}>{children}</code>;
}
