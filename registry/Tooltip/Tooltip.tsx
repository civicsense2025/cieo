'use client';
/* Tooltip. Hover/focus hint for icon-only controls. CSS reveal only; the trigger keeps its own accessible name. */
import { cloneElement, isValidElement, useId, type ReactNode } from 'react';
import { useDismissibleHint } from '../../react/index.js';
import { motionAttrs, type MotionProps } from '../motion.js';
export interface TooltipProps extends MotionProps { text: string; children: ReactNode; }
export function Tooltip({ text, children, motion, entering = 'fade', exiting = 'fade' }: TooltipProps) {
  const id = useId();
  const { dismissed, handlers } = useDismissibleHint();
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, { 'aria-describedby': id })
    : <span aria-describedby={id} className="cieo-p-tooltip-trigger">{children}</span>;
  return (<span className="cieo cieo-p-tooltip" data-dismissed={dismissed || undefined} {...handlers} {...motionAttrs({ motion, entering, exiting })}>
    {trigger}
    <span id={id} role="tooltip" className="cieo-p-tooltip-bubble">{text}</span>
  </span>);
}
