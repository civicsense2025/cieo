'use client';
/* Text. Body copy with size control. */
import type { ReactNode } from 'react';
export interface TextProps { as?: 'p' | 'span' | 'div'; size?: 'default' | 'small'; children: ReactNode; }
export function Text({ as: Tag = 'p', size = 'default', children }: TextProps) {
  return (<Tag data-size={size} className="cieo cieo-p-text">{children}</Tag>);
}
