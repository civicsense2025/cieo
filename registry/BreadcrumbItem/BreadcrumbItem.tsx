'use client';
/* BreadcrumbItem. One crumb: a link, or the current page marked aria-current. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export interface BreadcrumbItemProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
 current?: boolean; children: ReactNode; }
export function BreadcrumbItem({ className, slotProps, current = false, children }: BreadcrumbItemProps) {
  return (<li aria-current={current ? 'page' : undefined} className="cieo-p-crumb" {...customizePart(slotProps?.root, "cieo-p-crumb", undefined, className)}>{children}</li>);
}
