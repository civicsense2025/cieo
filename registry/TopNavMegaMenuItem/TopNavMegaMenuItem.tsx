// src/primitives/TopNavMegaMenuItem/TopNavMegaMenuItem.tsx
'use client';
/* TopNavMegaMenuItem. Link row with a title and an optional description. */

export interface TopNavMegaMenuItemProps {
  /** Link target. Required. */
  href: string;
  /** Row title. Required. */
  title: string;
  /** One-line supporting text. */
  description?: string;
}

export function TopNavMegaMenuItem({ href, title, description }: TopNavMegaMenuItemProps) {
  return (
    <a href={href} className="cieo cieo-top-nav-mega-menu-item">
      <span className="cieo-top-nav-mega-menu-item-title">{title}</span>
      {description ? <span className="cieo-top-nav-mega-menu-item-description">{description}</span> : null}
    </a>
  );
}
