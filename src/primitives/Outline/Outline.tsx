// src/primitives/Outline/Outline.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Outline. Table-of-contents nav built from an items array; links to section ids. */

export interface OutlineItem {
  id: string;
  label: string;
}

export interface OutlineProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name. Defaults to On this page. */
  label?: string;
  /** Sections to link; each renders an anchor to its id. Required. */
  items: OutlineItem[];
}

export function Outline({ className, slotProps, label = 'On this page', items }: OutlineProps) {
  return (
    <nav aria-label={label} className="cieo cieo-outline" {...customizePart(slotProps?.root, "cieo cieo-outline", undefined, className)}>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a href={'#' + item.id}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
