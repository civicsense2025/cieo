// src/primitives/ClickableCard/ClickableCard.tsx
'use client';
/* ClickableCard. Article card whose stretched link makes the whole card navigate; supports asChild and React 19 ref. */
import type { ComponentPropsWithRef, ReactNode, Ref } from 'react';
import { Slot } from '../Slot/Slot.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface ClickableCardProps extends Omit<ComponentPropsWithRef<'article'>, 'children'> {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Polymorphic child rendering: merges card classes, ref, and attributes onto the single child element. */
  asChild?: boolean;
  children: ReactNode;
}

export function ClickableCard({ children, className, slotProps, asChild = false, ref, style, ...rest }: ClickableCardProps) {
  const customized = customizePart(slotProps?.root, 'cieo cieo-clickable-card', style, className);
  if (asChild) {
    return (
      <Slot
        asChild
        ref={ref as Ref<HTMLElement>}
        {...(rest as Record<string, unknown>)}
        className="cieo cieo-clickable-card"
        style={style}
        {...customized}
      >
        {children}
      </Slot>
    );
  }
  return (
    <article ref={ref} {...rest} className="cieo cieo-clickable-card" style={style} {...customized}>
      {children}
    </article>
  );
}
