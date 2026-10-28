'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Breadcrumbs. Trail of links to the current page. The nav owns the label; the last crumb marks the page. */
import type { ReactNode } from 'react';
export interface BreadcrumbsProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
 label?: string; children: ReactNode; }
export function Breadcrumbs({ className, slotProps, label = 'Breadcrumb', children }: BreadcrumbsProps) {
  return (<nav aria-label={label} className="cieo cieo-p-breadcrumbs" {...customizePart(slotProps?.root, "cieo cieo-p-breadcrumbs", undefined, className)}><ol>{children}</ol></nav>);
}
