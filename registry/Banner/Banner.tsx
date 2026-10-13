// src/primitives/Banner/Banner.tsx
'use client';
/* Banner. role=status notice bar with an optional title. Host owns actions inside. */
import type { ReactNode } from 'react';
export interface BannerProps {
  /** Notice severity. Defaults to info. */
  tone?: 'info' | 'success' | 'warning' | 'danger';
  /** Short headline. Omit for body-only notices. */
  title?: string;
  /** The notice body and any actions. */
  children: ReactNode;
}

export function Banner({ tone = 'info', title, children }: BannerProps) {
  return (
    <div role="status" data-tone={tone} className="cieo cieo-p-banner">
      {title ? <p className="cieo-p-banner-title">{title}</p> : null}
      <div className="cieo-p-banner-body">{children}</div>
    </div>
  );
}
