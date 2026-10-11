'use client';
/* Badge. Small status label. Renders the design-system .cieo-badge so there is exactly one badge style; this file owns the contract, not the paint. */
import type { ReactNode } from 'react';
import { cx } from '../../controls/classes.js';
export type BadgeStatus = 'default' | 'success' | 'warning' | 'danger' | 'info';
export interface BadgeProps { status?: BadgeStatus; children: ReactNode; }
export function Badge({ status = 'default', children }: BadgeProps) {
  return (<span data-status={status} className={cx('cieo', 'cieo-badge')}>{children}</span>);
}
