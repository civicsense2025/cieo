'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* AuthResetForm. Request and confirmation steps swap inside a soft measured-height frame. */
import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { AuthEmailField } from '../AuthEmailField/AuthEmailField.js';
import { AuthPasswordInput } from '../AuthPasswordInput/AuthPasswordInput.js';
import { AuthMotionFrame, AuthMotionMessage, AuthSwapText } from '../AuthSignInCard/AuthMotion.js';

export interface AuthResetFormProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; submit?: PrimitivePartProps };

  id: string;
  step: 'request' | 'confirm';
  pending?: boolean;
  error?: string;
  style?: CSSProperties;
  onRequest: (email: string) => void;
  onConfirm: (password: string) => void;
}

export function AuthResetForm({ className, slotProps, id, step, pending, error, style, onRequest, onConfirm }: AuthResetFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const request = (e: FormEvent) => { e.preventDefault(); if (!pending) onRequest(email); };
  const confirm = (e: FormEvent) => { e.preventDefault(); if (!pending) onConfirm(password); };
  return (
    <div className="cieo cieo-auth-reset-form" style={style} {...customizePart(slotProps?.root, "cieo cieo-auth-reset-form", style, className)}>
      <AuthMotionFrame value={step}>
        {(shown, live) => shown === 'request' ? (
        <form onSubmit={request}>
          <AuthEmailField id={`${id}-email`} value={email} onChange={setEmail} />
          <AuthMotionMessage className="cieo-auth-error" role="alert" value={live ? error : undefined} />
          <button type="submit" className="cieo-auth-submit" disabled={pending || !live} {...customizePart(slotProps?.submit, "cieo-auth-submit")}>
            <AuthSwapText value={pending ? 'Sending…' : 'Send reset link'} />
          </button>
        </form>
      ) : (
        <form onSubmit={confirm}>
          <AuthPasswordInput id={`${id}-password`} value={password} onChange={setPassword} autoComplete="new-password" showStrength />
          <AuthMotionMessage className="cieo-auth-error" role="alert" value={live ? error : undefined} />
          <button type="submit" className="cieo-auth-submit" disabled={pending || !live} {...customizePart(slotProps?.submit, "cieo-auth-submit")}>
            <AuthSwapText value={pending ? 'Saving…' : 'Save new password'} />
          </button>
        </form>
      )}
      </AuthMotionFrame>
    </div>
  );
}
