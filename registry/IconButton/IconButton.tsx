'use client';
/* IconButton. Square icon-only button. Host supplies the icon node; label is always required. Native button props pass through. */
import type { ComponentPropsWithRef, ReactNode } from 'react';

export interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'aria-label' | 'children'> {
  label: string;
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function IconButton({ label, size = 'md', children, type = 'button', className, ...rest }: IconButtonProps) {
  return (<button {...rest} type={type} aria-label={label} data-size={size} className={className ? `cieo cieo-icon-button ${className}` : 'cieo cieo-icon-button'}>{children}</button>);
}
