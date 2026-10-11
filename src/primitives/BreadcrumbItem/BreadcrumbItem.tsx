'use client';
/* BreadcrumbItem. One crumb: a link, or the current page marked aria-current. */
import type { ReactNode } from 'react';
export interface BreadcrumbItemProps { current?: boolean; children: ReactNode; }
export function BreadcrumbItem({ current = false, children }: BreadcrumbItemProps) {
  return (<li aria-current={current ? 'page' : undefined} className="cieo-p-crumb">{children}</li>);
}
