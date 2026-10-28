'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
// src/primitives/InputGroup/InputGroup.tsx
/* InputGroup. Flex addon wrapper that joins a control with its prefix or suffix text. Host supplies the control and InputGroupText addons; this owns layout only. */
import type { ReactNode } from 'react';

export interface InputGroupProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the group (e.g. "Price in dollars"). Optional; pass when the addons alone do not name the control. */
  label?: string;
  children: ReactNode;
}

export function InputGroup({ className, slotProps, label, children }: InputGroupProps) {
  if (label === undefined) {
    return <div className="cieo cieo-p-input-group" {...customizePart(slotProps?.root, "cieo cieo-p-input-group", undefined, className)}>{children}</div>;
  }
  return (
    <div role="group" aria-label={label} className="cieo cieo-p-input-group" {...customizePart(slotProps?.root, "cieo cieo-p-input-group", undefined, className)}>
      {children}
    </div>
  );
}
