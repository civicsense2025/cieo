// src/primitives/SideNavItem/SideNavItem.tsx
'use client';
/* SideNavItem. Single link in the side rail; marks the current page and supports asChild + React 19 ref. */
import type { ComponentPropsWithRef, ReactNode, Ref } from 'react';
import { Slot } from '../Slot/Slot.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface SideNavItemProps extends Omit<ComponentPropsWithRef<'a'>, 'href' | 'children'> {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Link target. Required unless rendering a router link via asChild. */
  href?: string;
  /** Current page state; renders aria-current=page. Defaults to false. */
  current?: boolean;
  /** Polymorphic child rendering (e.g. Next.js <Link>). */
  asChild?: boolean;
  children: ReactNode;
}

export function SideNavItem({ className, slotProps, href, current = false, asChild = false, ref, style, children, ...rest }: SideNavItemProps) {
  const customized = customizePart(slotProps?.root, 'cieo cieo-side-nav-item', style, className);
  if (asChild) {
    return (
      <Slot
        asChild
        ref={ref as Ref<HTMLElement>}
        {...(rest as Record<string, unknown>)}
        {...(href !== undefined ? { href } : {})}
        aria-current={current ? 'page' : undefined}
        className="cieo cieo-side-nav-item"
        style={style}
        {...customized}
      >
        {children}
      </Slot>
    );
  }
  return (
    <a ref={ref} {...rest} href={href} aria-current={current ? 'page' : undefined} className="cieo cieo-side-nav-item" style={style} {...customized}>
      {children}
    </a>
  );
}
