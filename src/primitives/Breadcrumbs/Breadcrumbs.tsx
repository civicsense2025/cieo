'use client';
/* Breadcrumbs. Trail of links to the current page. The nav owns the label; the last crumb marks the page. */
import type { ReactNode } from 'react';
export interface BreadcrumbsProps { label?: string; children: ReactNode; }
export function Breadcrumbs({ label = 'Breadcrumb', children }: BreadcrumbsProps) {
  return (<nav aria-label={label} className="cieo cieo-p-breadcrumbs"><ol>{children}</ol></nav>);
}
