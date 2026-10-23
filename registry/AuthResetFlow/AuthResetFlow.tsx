'use client';
/* AuthResetFlow. Reset card whose request and confirmation panes share the auth motion frame. */
import type { CSSProperties } from 'react';
import { AuthCardShell } from '../AuthSignInCard/AuthSignInCard.js';
import { AuthResetForm } from '../AuthResetForm/AuthResetForm.js';

export interface AuthResetFlowProps {
  id: string;
  title?: string;
  step: 'request' | 'confirm';
  pending?: boolean;
  error?: string;
  status?: string;
  signinHref?: string;
  style?: CSSProperties;
  onRequest: (email: string) => void;
  onConfirm: (password: string) => void;
}

export function AuthResetFlow({ id, title = 'Reset your password', step, pending, error, status, signinHref, style, onRequest, onConfirm }: AuthResetFlowProps) {
  return (
    <AuthCardShell id={id} title={title} status={status} style={style} footer={signinHref ? <a href={signinHref}>Back to sign in</a> : null}>
      <AuthResetForm id={`${id}-form`} step={step} pending={pending} error={error} onRequest={onRequest} onConfirm={onConfirm} />
    </AuthCardShell>
  );
}
