// src/primitives/HoverCard/HoverCard.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* HoverCard. Rich hover card on the Tooltip CSS-reveal pattern. Trigger keeps its own name; content is the card body. */
import { cloneElement, isValidElement, useId, type ReactNode } from 'react';
import { useDismissibleHint } from '../../react/index.js';
import { motionAttrs, type MotionProps } from '../motion.js';

export interface HoverCardProps extends MotionProps {
  className?: string;
  slotProps?: { trigger?: PrimitivePartProps; root?: PrimitivePartProps; card?: PrimitivePartProps };

  /** Card body shown on hover and focus. Required. */
  content: ReactNode;
  children: ReactNode;
}

export function HoverCard({ className, slotProps, content, children, motion, entering = 'fade', exiting = 'fade' }: HoverCardProps) {
  const id = useId();
  const { dismissed, handlers } = useDismissibleHint();
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, { 'aria-describedby': id })
    : <span aria-describedby={id} className="cieo-p-hover-card-trigger" {...customizePart(slotProps?.trigger, "cieo-p-hover-card-trigger")}>{children}</span>;
  return (
    <span className="cieo cieo-p-hover-card" data-dismissed={dismissed || undefined} {...handlers} {...motionAttrs({ motion, entering, exiting })} {...customizePart(slotProps?.root, "cieo cieo-p-hover-card", undefined, className)}>
      {trigger}
      <span id={id} className="cieo-p-hover-card-card" {...customizePart(slotProps?.card, "cieo-p-hover-card-card")}>{content}</span>
    </span>
  );
}
