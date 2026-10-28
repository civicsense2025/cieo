// src/primitives/Card/Card.tsx
'use client';
/* Card. Section card with an optional title. Host owns the body; this owns surface semantics only. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import type { ReactNode } from 'react';

export interface CardProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; heading?: PrimitivePartProps };
  /** Card heading. Omit for title-less cards. */
  title?: string;
  children: ReactNode;
}

export function Card({ title, children, className, slotProps }: CardProps) {
  return (
    <section className="cieo cieo-card" {...customizePart(slotProps?.root, "cieo cieo-card", undefined, className)}>
      {title ? <h2 {...customizePart(slotProps?.heading, undefined, undefined)}>{title}</h2> : null}
      {children}
    </section>
  );
}
