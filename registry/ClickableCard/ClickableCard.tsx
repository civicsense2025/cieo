// src/primitives/ClickableCard/ClickableCard.tsx
'use client';
/* ClickableCard. Article card whose stretched link makes the whole card navigate. Children MUST contain exactly one link. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import type { ReactNode } from 'react';

export interface ClickableCardProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  children: ReactNode;
}

export function ClickableCard({ children, className, slotProps }: ClickableCardProps) {
  return (
    <article className="cieo cieo-clickable-card" {...customizePart(slotProps?.root, "cieo cieo-clickable-card", undefined, className)}>
      {children}
    </article>
  );
}
