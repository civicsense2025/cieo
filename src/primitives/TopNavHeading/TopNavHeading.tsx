// src/primitives/TopNavHeading/TopNavHeading.tsx
'use client';
/* TopNavHeading. Brand slot in the top nav; links home by default and supports asChild + React 19 ref. */
import type { ComponentPropsWithRef, ReactNode, Ref } from 'react';
import { Slot } from '../Slot/Slot.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface TopNavHeadingProps extends Omit<ComponentPropsWithRef<'a'>, 'href' | 'children'> {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Brand link target. Defaults to /. */
  href?: string;
  /** Polymorphic child rendering (e.g. Next.js <Link>). */
  asChild?: boolean;
  children: ReactNode;
}

export function TopNavHeading({ className, slotProps, href = '/', asChild = false, ref, style, children, ...rest }: TopNavHeadingProps) {
  const customized = customizePart(slotProps?.root, 'cieo cieo-top-nav-heading', style, className);
  if (asChild) {
    return (
      <Slot
        asChild
        ref={ref as Ref<HTMLElement>}
        {...(rest as Record<string, unknown>)}
        className="cieo cieo-top-nav-heading"
        style={style}
        {...customized}
      >
        {children}
      </Slot>
    );
  }
  return (
    <a ref={ref} {...rest} href={href} className="cieo cieo-top-nav-heading" style={style} {...customized}>
      {children}
    </a>
  );
}
