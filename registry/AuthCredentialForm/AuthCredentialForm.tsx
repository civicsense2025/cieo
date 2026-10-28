'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* AuthCredentialForm. Email plus password with motion-preserving pending and error states. */
import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { AuthEmailField } from '../AuthEmailField/AuthEmailField.js';
import { AuthMotionMessage, AuthSwapText } from '../AuthSignInCard/AuthMotion.js';
import { AuthPasswordInput } from '../AuthPasswordInput/AuthPasswordInput.js';

export interface AuthCredentialFormProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; submit?: PrimitivePartProps };

  id: string;
  /** Sign-in hides the strength meter; sign-up shows it. Defaults to "signin". */
  mode?: 'signin' | 'signup';
  pending?: boolean;
  error?: string;
  style?: CSSProperties;
  onSubmit: (values: { email: string; password: string }) => void;
}

export function AuthCredentialForm({ className, slotProps, id, mode = 'signin', pending, error, style, onSubmit }: AuthCredentialFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submit = (e: FormEvent) => { e.preventDefault(); if (!pending) onSubmit({ email, password }); };
  return (
    <form className="cieo cieo-auth-credential-form" style={style} onSubmit={submit} noValidate {...customizePart(slotProps?.root, "cieo cieo-auth-credential-form", style, className)}>
      <AuthEmailField id={`${id}-email`} value={email} onChange={setEmail} />
      <AuthPasswordInput
        id={`${id}-password`}
        value={password}
        onChange={setPassword}
        showStrength={mode === 'signup'}
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
      />
      <AuthMotionMessage className="cieo-auth-error" role="alert" value={error} />
      <button type="submit" className="cieo-auth-submit" disabled={pending} {...customizePart(slotProps?.submit, "cieo-auth-submit")}>
        <AuthSwapText value={pending ? (mode === 'signup' ? 'Creating account…' : 'Signing in…') : (mode === 'signup' ? 'Create account' : 'Sign in')} />
      </button>
    </form>
  );
}
