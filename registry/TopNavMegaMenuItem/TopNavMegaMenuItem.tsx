// src/primitives/TopNavMegaMenuItem/TopNavMegaMenuItem.tsx
'use client';
/* TopNavMegaMenuItem. Link row with a title and optional description; supports asChild + React 19 ref. */
import { cloneElement, isValidElement, type ComponentPropsWithRef, type ReactElement, type ReactNode, type Ref } from 'react';
import { mergeRefs, mergeSlotProps } from '../Slot/Slot.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface TopNavMegaMenuItemProps extends Omit<ComponentPropsWithRef<'a'>, 'href' | 'title' | 'children'> {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; title?: PrimitivePartProps; description?: PrimitivePartProps };
  /** Link target. Required unless rendering a router link via asChild. */
  href?: string;
  /** Row title. Required. */
  title: string;
  /** One-line supporting text. */
  description?: string;
  /** Polymorphic child rendering (e.g. Next.js <Link>). */
  asChild?: boolean;
  children?: ReactNode;
}

export function TopNavMegaMenuItem({
  className,
  slotProps,
  href,
  title,
  description,
  asChild = false,
  ref,
  style,
  children,
  ...rest
}: TopNavMegaMenuItemProps) {
  const customized = customizePart(slotProps?.root, 'cieo cieo-top-nav-mega-menu-item', style, className);
  const inner = (
    <>
      <span className="cieo-top-nav-mega-menu-item-title" {...customizePart(slotProps?.title, 'cieo-top-nav-mega-menu-item-title', undefined)}>
        {title}
      </span>
      {description ? (
        <span className="cieo-top-nav-mega-menu-item-description" {...customizePart(slotProps?.description, 'cieo-top-nav-mega-menu-item-description', undefined)}>
          {description}
        </span>
      ) : null}
    </>
  );

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const childRef = (child.props as { ref?: Ref<HTMLAnchorElement> }).ref ?? (child as unknown as { ref?: Ref<HTMLAnchorElement> }).ref;
    const mergedRef = mergeRefs<HTMLAnchorElement>(ref, childRef);
    const baseProps: Record<string, unknown> = {
      ...rest,
      ...(href !== undefined ? { href } : {}),
      className: 'cieo cieo-top-nav-mega-menu-item',
      style,
      ...customized,
    };
    const merged = mergeSlotProps(baseProps, child.props);
    return cloneElement(child, { ...merged, ...(mergedRef ? { ref: mergedRef } : {}), children: inner });
  }

  return (
    <a ref={ref} {...rest} href={href} className="cieo cieo-top-nav-mega-menu-item" style={style} {...customized}>
      {inner}
    </a>
  );
}
