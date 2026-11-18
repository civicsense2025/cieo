'use client';
/* IconButton. Square icon-only button with polymorphic asChild and React 19 ref forwarding. */
import type { ComponentPropsWithRef, ReactNode, Ref } from 'react';
import { Slot } from '../Slot/Slot.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'aria-label' | 'children'> {
  slotProps?: { root?: PrimitivePartProps };
  label: string;
  size?: 'sm' | 'md';
  /** Polymorphic child rendering: merges icon-button semantics and styling onto the single child element. */
  asChild?: boolean;
  children: ReactNode;
}

export function IconButton({
  slotProps,
  label,
  size = 'md',
  asChild = false,
  children,
  type = 'button',
  className,
  style,
  ref,
  ...rest
}: IconButtonProps) {
  const cls = className ? `cieo cieo-icon-button ${className}` : 'cieo cieo-icon-button';
  const customized = customizePart(slotProps?.root, cls, style);
  if (asChild) {
    return (
      <Slot
        asChild
        ref={ref as Ref<HTMLElement>}
        {...(rest as Record<string, unknown>)}
        aria-label={label}
        data-size={size}
        className={cls}
        style={style}
        {...customized}
      >
        {children}
      </Slot>
    );
  }
  return (
    <button {...rest} ref={ref} type={type} aria-label={label} data-size={size} className={cls} style={style} {...customized}>
      {children}
    </button>
  );
}
