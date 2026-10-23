'use client';
/* AuthEmailField. Labelled email input with a motion-preserving inline alert bound through aria-describedby. */
import type { CSSProperties } from 'react';
import { AuthMotionMessage } from '../AuthSignInCard/AuthMotion.js';

export interface AuthEmailFieldProps {
  /** Input id, also used to bind the label and the error message. */
  id: string;
  /** Visible label text. Defaults to "Email". */
  label?: string;
  /** Controlled value. Omit for uncontrolled use with defaultValue. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Error text. When set, the input is marked invalid and the message is announced. */
  error?: string;
  /** Disabled state. */
  disabled?: boolean;
  style?: CSSProperties;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export function AuthEmailField({ id, label = 'Email', value, defaultValue, error, disabled, style, onChange, onBlur }: AuthEmailFieldProps) {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <span className="cieo cieo-auth-email-field" data-invalid={error ? 'true' : undefined} style={style}>
      <label className="cieo-auth-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="cieo-auth-input"
        type="email"
        autoComplete="email"
        inputMode="email"
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        onChange={e => onChange?.(e.target.value)}
        onBlur={onBlur}
      />
      <AuthMotionMessage id={`${id}-error`} className="cieo-auth-error" role="alert" value={error} />
    </span>
  );
}
