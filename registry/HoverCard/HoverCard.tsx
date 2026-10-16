// src/primitives/HoverCard/HoverCard.tsx
'use client';
/* HoverCard. Rich hover card on the Tooltip CSS-reveal pattern. Trigger keeps its own name; content is the card body. */
import { cloneElement, isValidElement, useId, type ReactNode } from 'react';
import { useDismissibleHint } from '../../react/index.js';
import { motionAttrs, type MotionProps } from '../motion.js';

export interface HoverCardProps extends MotionProps {
  /** Card body shown on hover and focus. Required. */
  content: ReactNode;
  children: ReactNode;
}

export function HoverCard({ content, children, motion, entering = 'fade', exiting = 'fade' }: HoverCardProps) {
  const id = useId();
  const { dismissed, handlers } = useDismissibleHint();
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, { 'aria-describedby': id })
    : <span aria-describedby={id} className="cieo-p-hover-card-trigger">{children}</span>;
  return (
    <span className="cieo cieo-p-hover-card" data-dismissed={dismissed || undefined} {...handlers} {...motionAttrs({ motion, entering, exiting })}>
      {trigger}
      <span id={id} className="cieo-p-hover-card-card">{content}</span>
    </span>
  );
}
