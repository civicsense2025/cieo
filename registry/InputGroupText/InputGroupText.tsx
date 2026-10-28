'use client';
// src/primitives/InputGroupText/InputGroupText.tsx
/* InputGroupText. Short non-interactive addon text inside an InputGroup ($, .00, kg). Styled by design/styles/primitives/input-group.css, shared with InputGroup. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface InputGroupTextProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  children: ReactNode;
}

export function InputGroupText({ className, slotProps, children }: InputGroupTextProps) {
  return <span className="cieo cieo-p-input-group-text" {...customizePart(slotProps?.root, "cieo cieo-p-input-group-text", undefined, className)}>{children}</span>;
}
