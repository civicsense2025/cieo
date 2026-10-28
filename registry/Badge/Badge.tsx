'use client';
/* Badge. Small status label. Renders the design-system .cieo-badge so there is exactly one badge style; this file owns the contract, not the paint. */
import type { ReactNode } from 'react';
import { cx } from '../../controls/classes.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export type BadgeStatus = 'default' | 'success' | 'warning' | 'danger' | 'info';
export interface BadgeProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
 status?: BadgeStatus; children: ReactNode; }
export function Badge({ className, slotProps, status = 'default', children }: BadgeProps) {
  return (<span data-status={status} className={cx('cieo', 'cieo-badge')} {...customizePart(slotProps?.root, cx('cieo', 'cieo-badge'), undefined, className)}>{children}</span>);
}
