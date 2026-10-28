// src/primitives/TopNavMegaMenuItem/TopNavMegaMenuItem.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* TopNavMegaMenuItem. Link row with a title and an optional description. */

export interface TopNavMegaMenuItemProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; title?: PrimitivePartProps; description?: PrimitivePartProps };

  /** Link target. Required. */
  href: string;
  /** Row title. Required. */
  title: string;
  /** One-line supporting text. */
  description?: string;
}

export function TopNavMegaMenuItem({ className, slotProps, href, title, description }: TopNavMegaMenuItemProps) {
  return (
    <a href={href} className="cieo cieo-top-nav-mega-menu-item" {...customizePart(slotProps?.root, "cieo cieo-top-nav-mega-menu-item", undefined, className)}>
      <span className="cieo-top-nav-mega-menu-item-title" {...customizePart(slotProps?.title, "cieo-top-nav-mega-menu-item-title", undefined)}>{title}</span>
      {description ? <span className="cieo-top-nav-mega-menu-item-description" {...customizePart(slotProps?.description, "cieo-top-nav-mega-menu-item-description", undefined)}>{description}</span> : null}
    </a>
  );
}
