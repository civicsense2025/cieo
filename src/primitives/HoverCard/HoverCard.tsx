// src/primitives/HoverCard/HoverCard.tsx
'use client';
/* HoverCard. Rich hover card on the Tooltip CSS-reveal pattern. Trigger keeps its own name; content is the card body. */
import { cloneElement, isValidElement, useId, type ReactNode } from 'react';

export interface HoverCardProps {
  /** Card body shown on hover and focus. Required. */
  content: ReactNode;
  children: ReactNode;
}

export function HoverCard({ content, children }: HoverCardProps) {
  const id = useId();
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, { 'aria-describedby': id })
    : <span aria-describedby={id} className="cieo-p-hover-card-trigger">{children}</span>;
  return (
    <span className="cieo cieo-p-hover-card">
      {trigger}
      <span id={id} className="cieo-p-hover-card-card">{content}</span>
    </span>
  );
}
