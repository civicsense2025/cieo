// src/primitives/Blockquote/Blockquote.tsx
'use client';
/* Blockquote. Quoted passage with an optional source credit. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export interface BlockquoteProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; attribution?: PrimitivePartProps; source?: PrimitivePartProps };

  /** Source credit shown under the quote. Omit when unknown. */
  cite?: string;
  /** The quoted passage. */
  children: ReactNode;
}

export function Blockquote({ className, slotProps, cite, children }: BlockquoteProps) {
  return (
    <blockquote className="cieo cieo-p-blockquote" {...customizePart(slotProps?.root, "cieo cieo-p-blockquote", undefined, className)}>
      {children}
      {cite ? (
        <footer {...customizePart(slotProps?.attribution)}>
          <cite {...customizePart(slotProps?.source)}>{cite}</cite>
        </footer>
      ) : null}
    </blockquote>
  );
}
