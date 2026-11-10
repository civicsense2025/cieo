// src/primitives/SectionHeader/SectionHeader.tsx
'use client';
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* SectionHeader. Twin of CieoUI SectionHeader; stacks when narrow instead of truncating. */
export interface SectionHeaderProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  title: string;
  level?: 2 | 3 | 4;
  /** A link, count or menu after the title. */
  action?: ReactNode;
}
export function SectionHeader({ className, slotProps, title, level = 2, action }: SectionHeaderProps) {
  const Tag = `h${level}` as const;
  return (<div {...customizePart(slotProps?.root, "cieo cieo-p-section-header", undefined, className)}><Tag>{title}</Tag>{action ? <div className="cieo-p-section-header__action">{action}</div> : null}</div>);
}
