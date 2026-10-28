// src/primitives/NavHeadingMenu/NavHeadingMenu.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* NavHeadingMenu. Heading plus its menu group; section landmark with a visible title. */
import type { ReactNode } from 'react';

export interface NavHeadingMenuProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Visible heading and accessible name. Required. */
  label: string;
  children: ReactNode;
}

export function NavHeadingMenu({ className, slotProps, label, children }: NavHeadingMenuProps) {
  return (
    <section aria-label={label} className="cieo cieo-nav-heading-menu" {...customizePart(slotProps?.root, "cieo cieo-nav-heading-menu", undefined, className)}>
      <h2>{label}</h2>
      {children}
    </section>
  );
}
