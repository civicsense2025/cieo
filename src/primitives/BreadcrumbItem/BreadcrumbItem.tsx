'use client';
/* BreadcrumbItem. One crumb: a link, or the current page marked aria-current; supports asChild + React 19 ref. */
import type { ComponentPropsWithRef, ReactNode, Ref } from 'react';
import { Slot } from '../Slot/Slot.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface BreadcrumbItemProps extends Omit<ComponentPropsWithRef<'li'>, 'children'> {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  current?: boolean;
  /** Polymorphic child rendering. */
  asChild?: boolean;
  children: ReactNode;
}

export function BreadcrumbItem({ className, slotProps, current = false, asChild = false, ref, style, children, ...rest }: BreadcrumbItemProps) {
  const customized = customizePart(slotProps?.root, 'cieo-p-crumb', style, className);
  if (asChild) {
    return (
      <Slot
        asChild
        ref={ref as Ref<HTMLElement>}
        {...(rest as Record<string, unknown>)}
        aria-current={current ? 'page' : undefined}
        className="cieo-p-crumb"
        style={style}
        {...customized}
      >
        {children}
      </Slot>
    );
  }
  return (
    <li ref={ref} {...rest} aria-current={current ? 'page' : undefined} className="cieo-p-crumb" style={style} {...customized}>
      {children}
    </li>
  );
}
