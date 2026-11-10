// src/primitives/ContentFrame/ContentFrame.tsx
'use client';
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ContentFrame. Twin of CieoUI ContentFrame. Size it from the outside (aspect-ratio for a post, min-block-size for a band). */
export interface ContentFrameProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  ground?: 'page' | 'block';
  top?: ReactNode;
  bottom?: ReactNode;
  children: ReactNode;
}
export function ContentFrame({ className, slotProps, ground = 'page', top, bottom, children }: ContentFrameProps) {
  return (
    <section {...customizePart(slotProps?.root, "cieo cieo-p-content-frame", undefined, className)} data-ground={ground}>
      {top ? <div className="cieo-p-content-frame__top">{top}</div> : null}
      <div className="cieo-p-content-frame__body">{children}</div>
      {bottom ? <div className="cieo-p-content-frame__bottom">{bottom}</div> : null}
    </section>
  );
}
