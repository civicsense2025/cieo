// src/primitives/ClickableCard/ClickableCard.tsx
'use client';
/* ClickableCard. Article card whose stretched link makes the whole card navigate. Children MUST contain exactly one link. */
import type { ReactNode } from 'react';

export interface ClickableCardProps {
  children: ReactNode;
}

export function ClickableCard({ children }: ClickableCardProps) {
  return (
    <article className="cieo cieo-clickable-card">
      {children}
    </article>
  );
}
