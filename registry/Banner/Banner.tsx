// src/primitives/Banner/Banner.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Banner. role=status notice bar with an optional title. Host owns actions inside. */
import type { ReactNode } from 'react';
export interface BannerProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; title?: PrimitivePartProps; body?: PrimitivePartProps };

  /** Notice severity. Defaults to info. */
  tone?: 'info' | 'success' | 'warning' | 'danger';
  /** Short headline. Omit for body-only notices. */
  title?: string;
  /** The notice body and any actions. */
  children: ReactNode;
}

export function Banner({ className, slotProps, tone = 'info', title, children }: BannerProps) {
  return (
    <div role="status" data-tone={tone} className="cieo cieo-p-banner" {...customizePart(slotProps?.root, "cieo cieo-p-banner", undefined, className)}>
      {title ? <p className="cieo-p-banner-title" {...customizePart(slotProps?.title, "cieo-p-banner-title")}>{title}</p> : null}
      <div className="cieo-p-banner-body" {...customizePart(slotProps?.body, "cieo-p-banner-body")}>{children}</div>
    </div>
  );
}
