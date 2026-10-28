// src/primitives/TopNavMegaMenuFeaturedCard/TopNavMegaMenuFeaturedCard.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* TopNavMegaMenuFeaturedCard. Featured article card with optional media and link. */
import type { ReactNode } from 'react';

export interface TopNavMegaMenuFeaturedCardProps {
  className?: string;
  slotProps?: { title?: PrimitivePartProps; description?: PrimitivePartProps; root?: PrimitivePartProps };

  /** Card title. Required. */
  title: string;
  /** Supporting text. */
  description?: string;
  /** Link target; renders an article when absent. */
  href?: string;
  children?: ReactNode;
}

export function TopNavMegaMenuFeaturedCard({ className, slotProps, title, description, href, children }: TopNavMegaMenuFeaturedCardProps) {
  const body = (
    <>
      {children}
      <span className="cieo-top-nav-mega-menu-featured-card-title" {...customizePart(slotProps?.title, "cieo-top-nav-mega-menu-featured-card-title")}>{title}</span>
      {description ? <span className="cieo-top-nav-mega-menu-featured-card-description" {...customizePart(slotProps?.description, "cieo-top-nav-mega-menu-featured-card-description")}>{description}</span> : null}
    </>
  );
  if (href) {
    return (
      <a href={href} className="cieo cieo-top-nav-mega-menu-featured-card" {...customizePart(slotProps?.root, "cieo cieo-top-nav-mega-menu-featured-card", undefined, className)}>
        {body}
      </a>
    );
  }
  return <article className="cieo cieo-top-nav-mega-menu-featured-card" {...customizePart(slotProps?.root, "cieo cieo-top-nav-mega-menu-featured-card", undefined, className)}>{body}</article>;
}
