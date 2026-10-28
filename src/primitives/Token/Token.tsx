// src/primitives/Token/Token.tsx
'use client';
/* Token. Minimal pill for keywords and filters. Own paint; not Badge's. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export interface TokenProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Fill emphasis. Defaults to default. */
  tone?: 'default' | 'accent';
  /** The keyword or filter text. */
  children: ReactNode;
}

export function Token({ className, slotProps, tone = 'default', children }: TokenProps) {
  return (
    <span data-tone={tone} className="cieo cieo-p-token" {...customizePart(slotProps?.root, "cieo cieo-p-token", undefined, className)}>
      {children}
    </span>
  );
}
