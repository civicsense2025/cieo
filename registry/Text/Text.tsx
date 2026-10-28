'use client';
/* Text. Body copy with size control. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
export interface TextProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
 as?: 'p' | 'span' | 'div'; size?: 'default' | 'small'; children: ReactNode; }
export function Text({ className, slotProps, as: Tag = 'p', size = 'default', children }: TextProps) {
  return (<Tag data-size={size} className="cieo cieo-p-text" {...customizePart(slotProps?.root, "cieo cieo-p-text", undefined, className)}>{children}</Tag>);
}
