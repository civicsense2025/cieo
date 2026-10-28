// src/primitives/Section/Section.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Section. Page subdivision with an optional title heading. Host owns the content; this owns the landmark + spacing only. */
import type { ReactNode } from 'react';

export interface SectionProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; title?: PrimitivePartProps };

  /** Visible title rendered as a heading. Optional. */
  title?: string;
  /** Accessible name when there is no visible title. Optional. */
  label?: string;
  children: ReactNode;
}

export function Section({ className, slotProps, title, label, children }: SectionProps) {
  return (
    <section aria-label={label} className="cieo cieo-section" {...customizePart(slotProps?.root, "cieo cieo-section", undefined, className)}>
      {title ? <h2 className="cieo-section-title" {...customizePart(slotProps?.title, "cieo-section-title")}>{title}</h2> : null}
      {children}
    </section>
  );
}
