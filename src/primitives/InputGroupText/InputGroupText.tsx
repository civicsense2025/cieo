'use client';
// src/primitives/InputGroupText/InputGroupText.tsx
/* InputGroupText. Short non-interactive addon text inside an InputGroup ($, .00, kg). Styled by design/styles/primitives/input-group.css, shared with InputGroup. */
import type { ReactNode } from 'react';

export interface InputGroupTextProps {
  children: ReactNode;
}

export function InputGroupText({ children }: InputGroupTextProps) {
  return <span className="cieo cieo-p-input-group-text">{children}</span>;
}
