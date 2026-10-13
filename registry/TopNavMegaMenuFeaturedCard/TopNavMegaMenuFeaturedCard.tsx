// src/primitives/TopNavMegaMenuFeaturedCard/TopNavMegaMenuFeaturedCard.tsx
'use client';
/* TopNavMegaMenuFeaturedCard. Featured article card with optional media and link. */
import type { ReactNode } from 'react';

export interface TopNavMegaMenuFeaturedCardProps {
  /** Card title. Required. */
  title: string;
  /** Supporting text. */
  description?: string;
  /** Link target; renders an article when absent. */
  href?: string;
  children?: ReactNode;
}

export function TopNavMegaMenuFeaturedCard({ title, description, href, children }: TopNavMegaMenuFeaturedCardProps) {
  const body = (
    <>
      {children}
      <span className="cieo-top-nav-mega-menu-featured-card-title">{title}</span>
      {description ? <span className="cieo-top-nav-mega-menu-featured-card-description">{description}</span> : null}
    </>
  );
  if (href) {
    return (
      <a href={href} className="cieo cieo-top-nav-mega-menu-featured-card">
        {body}
      </a>
    );
  }
  return <article className="cieo cieo-top-nav-mega-menu-featured-card">{body}</article>;
}
