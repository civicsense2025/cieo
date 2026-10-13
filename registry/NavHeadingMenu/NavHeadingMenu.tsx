// src/primitives/NavHeadingMenu/NavHeadingMenu.tsx
'use client';
/* NavHeadingMenu. Heading plus its menu group; section landmark with a visible title. */
import type { ReactNode } from 'react';

export interface NavHeadingMenuProps {
  /** Visible heading and accessible name. Required. */
  label: string;
  children: ReactNode;
}

export function NavHeadingMenu({ label, children }: NavHeadingMenuProps) {
  return (
    <section aria-label={label} className="cieo cieo-nav-heading-menu">
      <h2>{label}</h2>
      {children}
    </section>
  );
}
