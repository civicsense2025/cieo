'use client';
// src/primitives/InputGroup/InputGroup.tsx
/* InputGroup. Flex addon wrapper that joins a control with its prefix or suffix text. Host supplies the control and InputGroupText addons; this owns layout only. */
import type { ReactNode } from 'react';

export interface InputGroupProps {
  /** Accessible name for the group (e.g. "Price in dollars"). Optional; pass when the addons alone do not name the control. */
  label?: string;
  children: ReactNode;
}

export function InputGroup({ label, children }: InputGroupProps) {
  if (label === undefined) {
    return <div className="cieo cieo-p-input-group">{children}</div>;
  }
  return (
    <div role="group" aria-label={label} className="cieo cieo-p-input-group">
      {children}
    </div>
  );
}
