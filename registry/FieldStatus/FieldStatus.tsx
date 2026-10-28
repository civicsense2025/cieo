'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
// src/primitives/FieldStatus/FieldStatus.tsx
/* FieldStatus. One help or error line under a control. Errors announce via role=alert; descriptions render as plain help text. */
export interface FieldStatusProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** The help or error text. Required. */
  message: string;
  /** Help tone renders plain text; error tone announces via role=alert. Defaults to description. */
  tone?: 'description' | 'error';
}

export function FieldStatus({ className, slotProps, message, tone = 'description' }: FieldStatusProps) {
  if (tone === 'error') {
    return (
      <p role="alert" className="cieo cieo-p-field-status" data-tone="error" {...customizePart(slotProps?.root, "cieo cieo-p-field-status", undefined, className)}>
        {message}
      </p>
    );
  }
  return (
    <p className="cieo cieo-p-field-status" data-tone="description" {...customizePart(slotProps?.root, "cieo cieo-p-field-status", undefined, className)}>
      {message}
    </p>
  );
}
