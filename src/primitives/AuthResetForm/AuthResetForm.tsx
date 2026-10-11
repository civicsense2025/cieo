'use client';
/* AuthResetForm (static). Request step plus confirm step for password reset. */
import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { AuthEmailField } from '../AuthEmailField/AuthEmailField';
import { AuthPasswordInput } from '../AuthPasswordInput/AuthPasswordInput';

export interface AuthResetFormProps {
  id: string;
  step: 'request' | 'confirm';
  pending?: boolean;
  error?: string;
  style?: CSSProperties;
  onRequest: (email: string) => void;
  onConfirm: (password: string) => void;
}

export function AuthResetForm({ id, step, pending, error, style, onRequest, onConfirm }: AuthResetFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const request = (e: FormEvent) => { e.preventDefault(); if (!pending) onRequest(email); };
  const confirm = (e: FormEvent) => { e.preventDefault(); if (!pending) onConfirm(password); };
  return (
    <div className="cieo cieo-auth-reset-form" style={style}>
      {step === 'request' ? (
        <form onSubmit={request}>
          <AuthEmailField id={`${id}-email`} value={email} onChange={setEmail} />
          {error ? <span className="cieo-auth-error" role="alert">{error}</span> : null}
          <button type="submit" className="cieo-auth-submit" disabled={pending}>
            {pending ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      ) : (
        <form onSubmit={confirm}>
          <AuthPasswordInput id={`${id}-password`} value={password} onChange={setPassword} autoComplete="new-password" showStrength />
          {error ? <span className="cieo-auth-error" role="alert">{error}</span> : null}
          <button type="submit" className="cieo-auth-submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      )}
    </div>
  );
}
