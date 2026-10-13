'use client';
// src/primitives/FieldStatus/FieldStatus.tsx
/* FieldStatus. One help or error line under a control. Errors announce via role=alert; descriptions render as plain help text. */
export interface FieldStatusProps {
  /** The help or error text. Required. */
  message: string;
  /** Help tone renders plain text; error tone announces via role=alert. Defaults to description. */
  tone?: 'description' | 'error';
}

export function FieldStatus({ message, tone = 'description' }: FieldStatusProps) {
  if (tone === 'error') {
    return (
      <p role="alert" className="cieo cieo-p-field-status" data-tone="error">
        {message}
      </p>
    );
  }
  return (
    <p className="cieo cieo-p-field-status" data-tone="description">
      {message}
    </p>
  );
}
