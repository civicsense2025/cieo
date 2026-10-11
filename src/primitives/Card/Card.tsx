// src/primitives/Card/Card.tsx
'use client';
/* Card. Section card with an optional title. Host owns the body; this owns surface semantics only. */
import type { ReactNode } from 'react';

export interface CardProps {
  /** Card heading. Omit for title-less cards. */
  title?: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <section className="cieo cieo-card">
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}
